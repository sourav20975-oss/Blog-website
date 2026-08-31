# [Solved] Python AttributeError: object has no attribute 'X'

The **AttributeError** is one of the first errors every Python programmer meets. It fires when you try to access an **attribute** (variable or method) that doesn't exist on the object you're using. Let's see exactly when it happens and how to handle it.

## What Is an AttributeError?

```python
>>> x = 5
>>> x.push()
AttributeError: 'int' object has no attribute 'push'
```

You asked an object for something it doesn't have. Python checked its attributes, found nothing, and raised.

## The 5 Common Causes (With Examples)

### 1. Accessing an Attribute That Doesn't Exist

```python
class Dog:
    def __init__(self, name):
        self.name = name

my_dog = Dog("Spike")
print(my_dog.age)
# AttributeError: 'Dog' object has no attribute 'age'
```

`__init__` only set `name`. `age` was never created — asking for it crashes.

### 2. Typo in the Attribute Name

```python
class Circle:
    def __init__(self, radius):
        self.radius = radius

my_circle = Circle(5)
print(my_circle.raduis)
# AttributeError: 'Circle' object has no attribute 'raduis'
```

`raduis` ≠ `radius`. Spelling matters — this is the #1 real-world cause.

### 3. Using an Attribute Before It's Created

```python
class Car:
    def __init__(self):
        pass          # speed never initialized!

my_car = Car()
print(my_car.speed)
# AttributeError: 'Car' object has no attribute 'speed'
```

### 4. Class vs Instance Attributes Confusion

```python
class BankAccount:
    interest_rate = 0.05

my_account = BankAccount()
my_account.interest_rate = 0.08   # sets it on the INSTANCE
other = BankAccount()
print(other.interest_rate)        # 0.05 — class default untouched
```

Mixing the two levels leads to surprising AttributeErrors and logic bugs. Remember: each instance has its own namespace; the class namespace is shared.

### 5. Calling a Method That Type Doesn't Support

```python
X = 200
X.append(11)
# AttributeError: 'int' object has no attribute 'append'
```

Integers have no `append` — that's a list method. Check what type you're actually holding.

## Handling It Gracefully: try/except

When user input or external data decides which attributes exist, catch the error:

```python
class Student:
    def __init__(self, name):
        self.name = name

my_student = Student("Rohan")

try:
    print(my_student.grade)
except AttributeError:
    print("Attribute not found.")
```

## Prevention Checklist

- ✅ Print `dir(obj)` to list every attribute the object actually has
- ✅ Double-check spelling (`radius` vs `raduis`, `colour` vs `color`)
- ✅ Make sure `__init__` initializes everything used later
- ✅ Use `hasattr(obj, 'attr')` before accessing optional attributes
- ✅ Verify the *type* of your variable — is it really the class you assumed?

AttributeErrors are annoying but incredibly informative — read the message, it literally names the missing attribute and the type that lacks it. Happy debugging!

