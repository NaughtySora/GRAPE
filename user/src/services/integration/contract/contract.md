## Application api contract
- demonstration purpose, not optimized.

#### Contract has 2 states, success | error

1. success:
- code - reflects kind of success details.
- status - status short verbal detail.
- data - payload of the response.

2. error:
- code - reflects kind of error.
- status - status short verbal explanation.
- data - always null, inspired by nodejs callback last, error first (errback), and js object
shapes.
- message - verbal message about particular error.
- retry - should request be retried, mainly for message queues.