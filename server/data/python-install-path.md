# How to Find the Python Installation Path on Windows

Whether you're setting up environment variables, configuring an IDE, or debugging a "python was not found" error, you need to know **exactly where Python is installed**. Here are two quick ways to find it on Windows.

## Method 1: Command Prompt (Classic)

### Step 1: Open CMD

Press `Win + R`, type `cmd`, hit Enter.

### Step 2: Use the `where` Command

```
where python
```

Windows prints every `python.exe` found in your PATH:

```
C:\Users\sourav\AppData\Local\Programs\Python\Python311\python.exe
C:\Users\sourav\AppData\Local\Microsoft\WindowsApps\python.exe
```

> The first line is usually the real interpreter. The `WindowsApps` one is the Microsoft Store alias stub — if it's the *only* hit, Python isn't actually installed and that's why you get the "Python was not found" error.

## Method 2: Windows Terminal / PowerShell (Modern)

### Step 1: Open Terminal

Search "Terminal" in the Start menu and open it.

### Step 2: Use `Get-Command`

```powershell
(Get-Command python).Path
```

Output:

```
C:\Users\sourav\AppData\Local\Programs\Python\Python311\python.exe
```

One clean path — perfect for pasting into environment variables or IDE settings.

## Bonus: From Inside Python Itself

If Python already runs but you need its home folder:

```python
import sys
print(sys.executable)   # path to python.exe
print(sys.prefix)       # installation root
```

## Which Method Should You Use?

| Situation | Best choice |
|---|---|
| Quick check in any terminal | `where python` (CMD) |
| Scripting / automation | `(Get-Command python).Path` (PowerShell) |
| Inside a running interpreter | `sys.executable` |

All three get you the same answer — pick whichever matches where you're already working. Happy coding!

> Source: adapted from CodeWithHarry's blog — [codewithharry.com/blogpost/how-to-find-python-installation-path](https://www.codewithharry.com/blogpost/how-to-find-python-installation-path)
