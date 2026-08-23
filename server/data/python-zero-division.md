# [Solved] ZeroDivisionError: division by zero in Python

Math says dividing by zero is undefined — and Python enforces that with the **ZeroDivisionError** exception. Here's what triggers it and the two standard ways to keep it from crashing your program.

## Seeing It Happen

```
>>> 1/0
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ZeroDivisionError: division by zero
```

Any of these trigger it too:

```python
a = 45
b = 0
result = a / b      # ZeroDivisionError!
```

```python
45 % 0    # modulo by zero → ZeroDivisionError
10 // 0   # floor division → ZeroDivisionError
```

## Fix 1: try/except Block

Best choice when the zero comes from **user input** or data you don't control:

```python
a = 10
b = int(input("Enter b: "))

try:
    result = a / b
except ZeroDivisionError:
    print("You can't divide by zero!")
    result = None
```

Instead of a crash, your program prints a friendly message and keeps running.

## Fix 2: Check Before Dividing

Best choice when the divisor comes from a calculation and you want explicit control flow:

```python
a = 10
b = 0

if b != 0:
    result = a / b
else:
    print("You can't divide by zero!")
    result = None
```

## Which Should You Use?

| Situation | Approach |
|---|---|
| Value from user input / API | `try/except ZeroDivisionError` |
| Simple known condition | `if b != 0` guard |
| Lots of math on messy data | try/except around the whole block |
| Performance-critical loop | `if` check (exceptions cost more) |

Both approaches are perfectly pythonic — EAFP ("easier to ask forgiveness than permission" = try/except) vs LBYL ("look before you leap" = if-check).

## Finding Hidden Division-by-Zero Bugs

In a large codebase the crash traceback points at the failing line, but the *reason* `b` was zero might be far away:

1. Read the traceback — note the exact line and variables
2. Add `print(b)` or use a debugger breakpoint just before the division
3. Trace where `b` came from — often a config default, empty list average (`sum([])/len([])`) or missing form field

## Conclusion

ZeroDivisionError means math said no. Wrap risky divisions in try/except, or guard with an `if` — and your program survives bad input gracefully. Happy coding!

