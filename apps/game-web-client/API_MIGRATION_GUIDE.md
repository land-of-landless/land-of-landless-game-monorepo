# 🔄 API Migration Guide - Donors Banner

This guide shows how to migrate from the mock JSON data to a real API.

## Current Setup (Mock)

The banner currently fetches from a local JSON file:

```
GET /data/donors.json
```

## Step 1: Prepare Your API

Your API should return data in this exact format:

```json
{
  "recent": [
    { "name": "Donor Name", "amount": 250 },
    { "name": "Another Donor", "amount": 500 }
  ],
  "weekly": [...],
  "monthly": [...],
  "allTime": [...]
}
```

## Step 2: Update the Hook

Open `hooks/useDonors.ts` and change line 29:

### Before (Mock)
```typescript
const response = await fetch("/data/donors.json");
```

### After (Real API)
```typescript
const response = await fetch("https://your-api.com/api/donors");
```

## Example API Implementations

### Option A: Simple HTTP Fetch

```typescript
// hooks/useDonors.ts
const fetchDonors = async () => {
  try {
    setIsLoading(true);
    const response = await fetch("https://api.example.com/donors");
    if (!response.ok) throw new Error("Failed to fetch donors");
    const data = await response.json();
    setDonors(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setIsLoading(false);
  }
};
```

### Option B: With Authentication

```typescript
const response = await fetch("https://api.example.com/donors", {
  headers: {
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    "Content-Type": "application/json",
  }
});
```

### Option C: With Error Retry

```typescript
const fetchDonors = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      setIsLoading(true);
      const response = await fetch("https://api.example.com/donors");
      if (response.ok) {
        const data = await response.json();
        setDonors(data);
        return;
      }
    } catch (err) {
      if (i === retries - 1) {
        setError("Failed to fetch donors after retries");
      }
    }
  }
  setIsLoading(false);
};
```

## Step 3: Handle Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_DONORS_API=https://api.example.com/donors
NEXT_PUBLIC_API_KEY=your_api_key_here
```

Update `useDonors.ts`:

```typescript
const response = await fetch(
  process.env.NEXT_PUBLIC_DONORS_API || "/data/donors.json"
);
```

## Step 4: Add Real-Time Updates (Optional)

### Polling Every 30 Seconds

```typescript
useEffect(() => {
  fetchDonors();
  
  const interval = setInterval(() => {
    fetchDonors();
  }, 30000); // 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

### WebSocket Connection

```typescript
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/donors-stream");
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setDonors(data);
  };
  
  return () => ws.close();
}, []);
```

## Step 5: Testing

### Test with Mock Data First

Keep the mock JSON during development:
```typescript
const isDevelopment = process.env.NODE_ENV === "development";

const apiUrl = isDevelopment 
  ? "/data/donors.json" 
  : process.env.NEXT_PUBLIC_DONORS_API;

const response = await fetch(apiUrl);
```

### Test Error Handling

```typescript
// Force error for testing
const response = await fetch("https://api.example.com/invalid");
// Component should gracefully show empty state
```

## Full Example: Complete Hook Migration

Here's a complete refactored `useDonors.ts`:

```typescript
import { useEffect, useState } from "react";

export interface Donor {
  name: string;
  amount: number;
}

export interface DonorsData {
  recent: Donor[];
  weekly: Donor[];
  monthly: Donor[];
  allTime: Donor[];
}

const API_URL = process.env.NEXT_PUBLIC_DONORS_API || "/data/donors.json";
const REFRESH_INTERVAL = 60000; // 1 minute

export const useDonors = () => {
  const [donors, setDonors] = useState<DonorsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL, {
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch donors`);
        }

        const data = await response.json();
        
        // Validate data structure
        if (!data.recent || !data.weekly || !data.monthly || !data.allTime) {
          throw new Error("Invalid donor data structure");
        }

        setDonors(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Failed to fetch donors:", message);
        
        // Set empty data as fallback
        setDonors({
          recent: [],
          weekly: [],
          monthly: [],
          allTime: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchDonors();

    // Refresh interval
    const interval = setInterval(fetchDonors, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { donors, isLoading, error };
};
```

## API Response Format Examples

### Minimal Response

```json
{
  "recent": [],
  "weekly": [],
  "monthly": [],
  "allTime": []
}
```

### Production Response

```json
{
  "recent": [
    {
      "name": "Jane Developer",
      "amount": 1500
    },
    {
      "name": "Bob Builder",
      "amount": 2000
    }
  ],
  "weekly": [
    {
      "name": "Alice Coder",
      "amount": 500
    }
  ],
  "monthly": [
    {
      "name": "Charlie Team",
      "amount": 5000
    }
  ],
  "allTime": [
    {
      "name": "Legend Supporter",
      "amount": 50000
    }
  ]
}
```

## Database Schema (if building your own API)

```sql
CREATE TABLE donors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT true,
  category ENUM('one-time', 'monthly', 'yearly') DEFAULT 'one-time'
);

CREATE TABLE donor_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(10, 2) NOT NULL,
  badge_color VARCHAR(7) NOT NULL,
  badge_icon VARCHAR(100)
);
```

## Troubleshooting

### Banner Shows Empty

1. Check network tab - API call returning data?
2. Verify API response format matches DonorsData interface
3. Check browser console for error messages
4. Ensure CORS is configured on your API

### Slow Loading

1. Add caching headers to API responses
2. Implement CDN for API responses
3. Reduce refresh interval if polling
4. Use compression on API responses

### Data Not Updating

1. Check REFRESH_INTERVAL in hook
2. Verify API is returning fresh data
3. Check browser cache settings
4. Inspect Network tab for cache headers

## Production Checklist

- [ ] API endpoint tested and working
- [ ] Authentication/API keys secured in `.env.local`
- [ ] Error handling working (empty state shows gracefully)
- [ ] CORS configured if needed
- [ ] Rate limiting considered
- [ ] Refresh interval set appropriately
- [ ] Fallback data strategy in place
- [ ] Monitoring/logging set up
- [ ] Performance tested with real data
- [ ] Mobile responsiveness verified

## Rollback to Mock

If you need to revert to mock data temporarily:

```typescript
const API_URL = process.env.NODE_ENV === "production"
  ? process.env.NEXT_PUBLIC_DONORS_API
  : "/data/donors.json";
```

Or simply update the environment variable.

---

**Need Help?** Check `DONORS_FEATURE.md` for more details on the component.
