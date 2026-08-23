# How to Generate Random Numbers in C Language

Random numbers power games, simulations, sampling, testing — lots of real programs. In C, everything revolves around two functions from `<stdlib.h>`: **`rand()`** and **`srand()`**.

## Method 1: `rand()` — The Basics

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int random_number = rand();
    printf("Random Number: %d\n", random_number);
    return 0;
}
```

**Output:** some integer between `0` and `RAND_MAX`.

Run it twice, though, and notice something suspicious — you often get the **same number both times**. That's because `rand()` generates *pseudo-random* numbers from a deterministic sequence. Without a different starting point (a seed), every fresh run replays the same sequence from the beginning.

## Method 2: Seed With `srand()`

To get different results on every run, seed the generator once at program start with the current time:

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    srand(time(0));   // seed = seconds since epoch → changes every run

    int random_number = rand();
    printf("Random Number: %d\n", random_number);
    return 0;
}
```

**Output:** now every execution produces a different value, because the seed itself changes each second.

## Random Numbers in a Range

`rand()` gives you `0..RAND_MAX`, but games want dice rolls (`1..6`) etc. Use modulo:

```c
int die = rand() % 6 + 1;              // 1..6
int percent = rand() % 100;            // 0..99
int low_to_high = low + rand() % (high - low + 1);   // low..high inclusive
```

## Comparing the Two Approaches

### `rand()` without seeding

- ✅ Simple; deterministic sequence (handy for reproducible tests)
- ❌ Same sequence every run — not "random" to a user

### `srand(time(0))` + `rand()`

- ✅ Different output every run — what most programs actually want
- ❌ Still pseudo-random (never use for cryptography!)
- ❌ Two runs started within the same second can repeat the seed

## Golden Rules

1. Call **`srand()` exactly once** at program start — re-seeding repeatedly makes output *less* random.
2. Use `% range` to shrink values into your desired interval.
3. For security-sensitive randomness, this is the wrong tool entirely.

That's the whole story: `rand()` picks from a fixed sequence, `srand(time(0))` shuffles where the sequence starts. Happy coding!

