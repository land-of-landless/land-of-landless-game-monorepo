/**
 * Archive Data
 * Lore book content for the Town Archives zone
 */

export interface ArchivePage {
  title: string;
  content: string;
}

/**
 * Chronicles of Landless
 * Historical records and ancient lore of the Land of Landless
 */
export const ARCHIVE_PAGES: ArchivePage[] = [
  {
    title: "Volume I: The Monorepo Genesis",
    content:
      "Before the great convergence, developers roamed in separate repositories, lost in dependency conflicts. Then came the great Monorepo structure, uniting the Next.js Game Client and the PostgreSQL Game Server under a single package manager. Standardized linting and shared assets bound the kingdoms together, achieving absolute builds and unified exports.",
  },
  {
    title: "Volume II: The Riddle of Rapier",
    content:
      "Physics was but a dream until the Rapier engine was forged. The floating capsule controllers, once sliding aimlessly in frictionless vacuum, were given mass, friction, and gravity. Ground meshes were given solid colliders and precise friction coefficients, enabling players to sprint, jump, and interact with the physical objects of the realm.",
  },
  {
    title: "Volume III: The Statue Prophecy",
    content:
      "Legend tells of a magnificent monument that will stand in the center of the City Hall. Though today only a glowing holographic energy matrix floats upon the pedestal, the ancient developer scrolls foretell of an engineer who will write a Statue schema into the database, model a gorgeous polygon structure, and materialize the monument for all to witness.",
  },
];

/**
 * Get total number of archive pages
 */
export const ARCHIVE_PAGES_COUNT = ARCHIVE_PAGES.length;

/**
 * Get archive page by index with bounds checking
 */
export const getArchivePage = (index: number): ArchivePage => {
  const boundedIndex = Math.max(0, Math.min(index, ARCHIVE_PAGES.length - 1));
  return ARCHIVE_PAGES[boundedIndex];
};

/**
 * Check if index is at the last page
 */
export const isLastArchivePage = (index: number): boolean => {
  return index >= ARCHIVE_PAGES.length - 1;
};

/**
 * Check if index is at the first page
 */
export const isFirstArchivePage = (index: number): boolean => {
  return index <= 0;
};
