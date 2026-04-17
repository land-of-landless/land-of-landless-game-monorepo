# Game Constants

This directory contains all the constant values used throughout the game. Each file is responsible for a specific game feature.

## `energyGenerator.ts`

This file contains constants related to the **Energy Generator** building.

- `ENERGY_GENERATOR_UPGRADE_INFO`: Defines the cost, time, and maximum panels for each level of the Energy Generator.
- `ENERGY_GENERATOR_MAX_ENERGY_GENERATION_RATE`: The maximum rate at which energy can be generated.
- `ENERGY_GENERATOR_COST_PER_PANEL`: The cost of each additional panel for the energy generator.
- `ENERGY_GENERATOR_INCREASE_PER_PANEL`: The amount of energy generation increase per panel.
- `ENERGY_GENERATOR_MAX_LEVEL`: The maximum level the Energy Generator can be upgraded to.

## `factory.ts`

This file contains constants related to the **Factory** building.

- `FACTORY_BUILDING_PADS`: Defines the minimum level required to unlock each building pad in the factory.
- `FACTORY_UPGRADE_INFO`: Defines the cost and time for each level of the Factory.
- `FACTORY_ITEMS_COST_INFO`: Defines the cost, mineral cost, maximum count, and build time for each item that can be built in the factory.
- `FACTORY_MAX_LEVEL`: The maximum level the Factory can be upgraded to.
- `FACTORY_MAX_BUILDING_PADS`: The maximum number of building pads in the factory.

## `games.ts`

This file contains constants related to the mini-games.

- `GAMES_ENERGY_COST`: Defines the energy cost for playing each mini-game.

## `general.ts`

This file contains general constants that are used across multiple features.

- `UpgradeOrBuildOperation`: Defines the valid operations for upgrading or building.

## `lab.ts`

This file contains constants related to the **Lab** building.

- `LAB_UPGRADE_INFO`: Defines the cost and time for each level of the Lab.
- `LAB_ITEMS_UPGRADE_INFO`: Defines the cost and maximum step for each research item in the lab.
- `LAB_FACTORY_ITEMS_UPGRADE_INFO`: Defines the minimum tech level required to build each factory item.
- `LAB_MAX_LEVEL`: The maximum level the Lab can be upgraded to.

## `mine.ts`

This file contains constants related to the **Mine** building and mineral collection.

- `MINE_MAX_MINER_COUNT`: The maximum number of miners a user can have.
- `MINE_MAX_LEVEL_PER_MINER`: The maximum level a single miner can be upgraded to.
- `MINE_GENERATION_BASE_RATE`: The base rate of mineral generation for a new miner.
- `MINE_GENERATION_RATE_INCREASE_PER_LEVEL`: The increase in mineral generation rate for each level upgrade of a miner.
- `MINE_MAX_MINERAL_GENERATION_RATE`: The maximum possible mineral generation rate.
- `MINE_UPGRADE_INFO`: Defines the cost, energy generation rate, and time for each level of a miner.

## `payment.ts`

This file contains constants related to payments.

- `PAYMENT_MINIMUM_REMAINING_TIME_SECS`: The minimum remaining time for a payment to be valid, in seconds.

## `profile.ts`

This file contains constants related to the user's profile.

- `LOOT_BOX_TIME_TO_OPEN`: The time it takes to open a loot box.
- `BASE_REWARDS`: The base rewards a user receives.
- `XP_PER_LEVEL`: The experience points required for each level.
- `gemsPerMinute`: The number of gems a user receives per minute.
- `lolSoldierNames`: A list of names for the LOL soldiers.
- `lolSoldierProfilePics`: A list of profile picture IDs for the LOL soldiers.

## `shop.ts`

This file contains constants related to the in-game shop.

- `SHOP_GEM_ITEMS`: Defines the gem amount and cost for each gem package.
- `SHOP_ROBOT_ITEMS`: Defines the cost for each robot.
- `SHOP_PASS_ITEMS`: Defines the cost for the game pass.
- `SHOP_COIN_ITEMS`: Defines the coin amount and cost for each coin package.
- `MAX_PURCHASE_INVOICE_REQUEST_PER_HOUR`: The maximum number of purchase invoice requests a user can make per hour.
- `MIN_TIME_PAST_TO_ELIGIBLE_FOR_MANUAL_INVOICE_PROCESSING`: The minimum time that must have passed for a user to be eligible for manual invoice processing.

# Resource Limits

- **Coins**: The maximum number of coins a user can have is `50,000,000`.
- **Minerals**: The maximum number of minerals a user can have is `500,000`.
- **Gems**: There is no limit to the number of gems a user can have.
