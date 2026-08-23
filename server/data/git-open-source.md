## Open Source Contribution — Basic Concept

Original repo = owner ka project, jahan normally direct push permission nahi hoti.

**Fork** = original repo ki GitHub par tumhare account mein copy.

| Name | Meaning | Use |
| --- | --- | --- |
| `origin` | Tumhara GitHub fork | Push |
| `upstream` | Original GitHub repo | Fetch / update |

```
Fork → Clone → Upstream → Branch → Commit → Push → Pull Request
```

---

## Complete PR Workflow

1. **Fork** — GitHub par original repo kholo → Fork → Create fork.
2. **Clone your fork** — Original repo nahi, apna fork clone karo.
3. **Add upstream** — Original repository ko `upstream` remote ke naam se add karo.
4. **New branch** — `main`/`master` par direct kaam na karo. Feature/fix branch banao.
5. **Code** — Required changes karo aur test karo.
6. **Stage + Commit** — `git add .` → `git commit -m "..."`
7. **Push** — Apni branch ko `origin` par push karo.
8. **Pull Request** — Base = original repo; Head = tumhara fork + branch.
9. **Review** — Owner comments/changes maang sakta hai.
10. **Merge** — Owner approve karke PR merge karta hai.

---

## Essential Commands

```bash
# Clone your fork (not the original!)
git clone https://github.com/YOUR-USERNAME/REPO.git
cd REPO

# Check remotes
git remote -v

# Add original repo as upstream
git remote add upstream https://github.com/OWNER/REPO.git

# Create a branch
git checkout -b fix-something
# or the modern way
git switch -c fix-something

# Check changes
git status

# Stage
git add .

# Commit
git commit -m "Fix: something"

# Push your branch to your fork
git push -u origin fix-something
```

> `-u` (upstream tracking) sirf pehli push pe chahiye — uske baad sirf `git push` kaafi hai us branch se.

---

## Original Repo Ke New Changes Local Mein Lana

Agar original repository mein naye changes aa gaye hain aur tum unhe apne local `main` mein lana chahte ho:

```bash
cd FIRSTPROJECT

# 1. Original repo se latest information lao
git fetch upstream

# 2. Local main par jao
git checkout main

# 3. Original main ko local main mein merge karo
git merge upstream/main

# 4. Apne GitHub fork ko bhi update karna ho to
git push origin main
```

### Shortcut: Sync Fork Button

GitHub har fork ke page pe ek **"Sync fork"** button bhi deta hai — one click mein upstream se update ho jata hai. CLI wala tareeka samajhne ke baad hi use karo, warna debugging mushkil hoti hai.

---

## Agar Feature Branch Par Kaam Chal Raha Ho

Example: tum `fix-login-error` branch par ho aur original repo mein naye changes aa gaye. Pehle `main` update karo, phir updated `main` ko feature branch mein merge karo.

```bash
# Main update karo
git checkout main
git fetch upstream
git merge upstream/main

# Feature branch par wapas jao
git checkout fix-login-error

# Updated main ko feature branch mein lao
git merge main
```

### Merge vs Rebase for Updates

| Approach | Command | History |
| --- | --- | --- |
| Merge | `git merge main` | Extra merge commit banati hai |
| Rebase | `git rebase main` | Tumhare commits ko naye commits ke upar "replay" karti hai — clean linear history |

Many maintainers prefer:

```bash
git fetch upstream
git rebase upstream/main
```

> Golden rule: kabhi bhi pushed/public branch pe force-push rebase na karo jab tak maintainer na maange. Apni feature branch pe `git push --force-with-lease` rebase ke baad normal hai.

---

## Merge Conflicts Ka Basic Fix

Conflict tab hota hai jab do branches same lines badal deti hain:

```text
<<<<<<< HEAD
tumhara change
=======
upstream ka change
>>>>>>> upstream/main
```

Steps:

```bash
git status                     # conflicted files dikhega (both modified)
# file kholo, <<<<<< ======= >>>>>> markers hatao, final code rakho
git add file.js
git commit                     # merge complete
```

Conflicts darne ki cheez nahi hai — bas dono sides padhkar sahi version decide karna hota hai.

---

## Good Issue Kaise Dhundhein

Beginners ke liye best entry points:

- Repo ke Issues me labels dekho: `good first issue`, `help wanted`, `documentation`
- Search on GitHub: `label:"good first issue" language:javascript state:open`
- Sites: [goodfirstissue.dev](https://goodfirstissue.dev), [up-for-grabs.net](https://up-for-grabs.net)
- Docs typo/translation fixes se shuruaat karo — low risk, high confidence

Contribute karne se pehle repo ki ye files zaroor padho:

- **CONTRIBUTING.md** — setup steps, commit style, PR rules
- **CODE_OF_CONDUCT.md** — behaviour expectations
- Closed PRs — dekho maintainers kya style accept karte hain

---

## Ek Achha PR Kaise Bane

**Branch naming:** `fix/login-error`, `feat/dark-mode`, `docs/readme-update`

**Commit message style (jo zyadatar projects me chalega):**

```
Fix: resolve null pointer in login handler

- added guard clause for empty email input
- added test case for empty credentials
```

**PR description template:**

```markdown
## What does this PR do?
Briefly explains the change.

## Related Issue
Fixes #123

## Changes Made
- Added X
- Updated Y

## Screenshots (if UI change)
Before / After images

## Checklist
- [x] Tested locally
- [x] Ran existing tests
```

### "Fixes #123" Magic Line

PR description me `Fixes #123`, `Closes #45` ya `Resolves #78` likhne se **merge hote hi wo issue automatically close** ho jata hai, aur PR issue se link ho jata hai. Ye likhna mat bhoolna — maintainers isse turant samajh jaate hain ki PR kis problem ko solve kar raha hai.

---

## Review Comments Handle Karna

Maintainers changes maang sakte hain — ye normal hai, rejection nahi!

```bash
# Unki feedback implement karo, phir same branch pe push karo
git add .
git commit -m "Address review feedback"
git push
```

PR **automatically update** ho jata hai naye push se. Naya PR kholne ki zaroorat nahi. Review me polite raho: "Thanks for reviewing!" jaise chhote messages bhi achhe lagte hain.

### CI Checks

Bade repos me PR khulte hi automated tests/builds chalte hain. Red ❌ aaye toh:

```bash
# logs padho, local pe tests chala kar dekho
npm test
```

Green ✅ hone tak fix karo — merge ke chances tabhi bante hain.

---

## Merge Ke Baad Cleanup

```bash
# local main update
git checkout main
git fetch upstream
git merge upstream/main
git push origin main

# purani feature branch delete
git branch -d fix-login-error          # local
git push origin --delete fix-login-error   # fork se delete
```

Fork ka `main` fresh rakho — agli contribution ke liye hamesha `main` se nayi branch banao.

---

## Commits Squash Karna (Kabhi Kabhi Zaroori)

Review me 15 chhote-chhote commits ho jayein ("fix", "typo", "again fix") toh maintainers clean mangwa sakte hain:

```bash
git rebase -i HEAD~5        # last 5 commits interactive edit
# editor me 'pick' ko 'squash' (s) me badlo jo milane hain
git push --force-with-lease
```

Note: bahut se repos **"Squash and merge"** button se khud hi sab commits ko ek bana lete hain — tab manual squash optional hai.

---

## Flow Yaad Rakho

```
Original Repo  (owner ka project, e.g., Sambit-77/FIRSTPROJECT)
      ↓  Fork
Your Fork      (e.g., sourav842741/FIRSTPROJECT)
      ↓  clone
Your Local Computer   (branch + code + commit)
      ↓  push branch
Your Fork / Branch
      ↓  Pull Request
Original Repo
      ↓
Merge ✓
```

---

## Quick Revision Cheat Sheet

```bash
git clone ...                 # apna fork local mein lao
git remote -v                 # origin/upstream check
git remote add upstream ...   # original repo connect
git fetch upstream            # original ke latest changes lao
git checkout main             # main branch par jao
git merge upstream/main       # original main ko local main mein merge
git checkout -b feature       # new working branch
git add .                     # changes stage
git commit -m "message"       # checkpoint
git push -u origin feature    # apne fork par push
# GitHub → Pull Request → original repo ko request
```

---

## Common Mistakes

| Wrong | Right |
| --- | --- |
| Original repo clone karke direct push karna | Apna fork clone karo |
| `main` par direct coding | Feature/fix branch banao |
| `git push upstream ...` | Apne fork ke liye `origin` use karo |
| PR direction ulta (base = fork) | Base = original repo, Head = your fork/branch |
| Stale fork se naya kaam shuru karna | Pehle `main` ko upstream se sync karo |
| PR me issue link na hona | `Fixes #123` likhna |

---

## One-Line Memory Trick

```
Fork → Clone → Upstream → Branch → Code → Add → Commit → Push → PR → Review → Merge
```

---

## Conclusion

Open source contribution ek fixed repeatable workflow hai: fork, clone, upstream add karo, branch banao, code karo, push karo, PR kholo — aur review handle karke merge karwao. Pehla PR docs fix se hi karo, `Fixes #issue` likhna mat bhoolo, aur merge ke baad cleanup + sync zaroor karo. Ek PR merge hone ke baad dusra khud se lene lagta hai!
