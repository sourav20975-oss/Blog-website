# Build an Email Validator with HTML, CSS, and JavaScript

Let's build a complete mini-project: an **Email Validator** website that takes an email address and tells you whether it's real, using a free validation API. Perfect first API project — you'll touch forms, fetch, async/await, and responsive CSS.

## What We're Building

- A page with an email input + Submit button
- Results panel showing validity, MX records, disposable-flag, etc.
- Fully responsive (mobile-friendly) design

## Step 1: HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iValidate — Email Validator for your Business</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav>
      <div class="logo">
        <img src="img/email.svg" alt="email svg">
        <span>iValidate</span>
      </div>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/">About</a></li>
        <li><a href="/">Contact Us</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <div class="container">
      <h1>Enter your email to validate</h1>
      <form action="/submit" method="post">
        <input placeholder="Enter your email to validate"
               type="text" id="username" name="username" required>
        <br><br>
        <input id="submitBtn" class="btn" type="submit" value="Submit">
      </form>
    </div>

    <div class="container">
      <h2>Your Results</h2>
      <div id="resultCont">
        Your results will show here
      </div>
    </div>
  </main>

  <footer>
    Copyright | iValidate.com | All Rights reserved
  </footer>

  <script src="js/index.js"></script>
</body>
</html>
```

Two containers: one for the form, one for results. That's all the structure we need.

## Step 2: Styling With CSS (Responsive)

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@700&family=Poppins:wght@300;400;500;600&display=swap');

* {
  padding: 0;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: black;
  color: white;
  padding: 19px 12px;
}

ul { display: flex; }

ul li {
  list-style: none;
  padding: 0 13px;
}

ul li a {
  color: white;
  text-decoration: none;
}

ul > li > a:hover {
  color: rgb(192, 189, 205);
}

main { min-height: 100vh; }

.logo img {
  width: 15px;
  filter: invert(1);
}

.container {
  max-width: 80vw;
  margin: auto;
  padding: 9px 15px;
}

.container h1 { padding: 12px 0; }

input[type='text'] {
  min-width: 23vw;
  padding: 3px 12px;
  border: 2px solid black;
  border-radius: 4px;
  font-size: 20px;
}

.btn {
  background: black;
  color: white;
  padding: 9px 12px;
  border: 1px solid gray;
  border-radius: 6px;
  cursor: pointer;
}

#resultCont div::first-letter {
  text-transform: uppercase;
}

footer {
  font-size: 12px;
  background-color: black;
  color: white;
  display: flex;
  padding: 12px;
  justify-content: center;
  align-items: center;
}

/* Mobile */
@media only screen and (max-width: 600px) {
  .container { font-size: 12px; }
  input[type='text'] { width: 100%; }
  nav { flex-direction: column; }
  .logo { padding: 6px 0; }
}
```

The media query is what makes it work on phones — full-width input, stacked nav.

## Step 3: The Logic (JavaScript + API)

Get a free API key from [emailvalidation.io](https://emailvalidation.io/) (free tier = 100 checks/month). Then create `js/index.js`:

```js
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("Clicked!");

  // show a loading state while we wait
  resultCont.innerHTML = `<img width="123" src="img/loading.svg" alt="">`;

  let key = "YOUR-API-KEY";   // ← replace with your real key
  let email = document.getElementById("username").value;
  let url = `https://api.emailvalidation.io/v1/info?apikey=${key}&email=${email}`;

  let res = await fetch(url);
  let result = await res.json();

  let str = ``;
  for (key of Object.keys(result)) {
    if (result[key] !== "" && result[key] !== " ") {
      str = str + `<div>${key}: ${result[key]}</div>`;
    }
  }
  resultCont.innerHTML = str;
});
```

## How the Code Works

1. **`e.preventDefault()`** — stops the form from doing a full-page POST reload
2. **Loading state** — swap in a spinner so users know something's happening
3. **Build the URL** — API key + user's email as query params
4. **`await fetch(url)`** — call the API; `await` pauses until the response arrives
5. **`res.json()`** — parse the JSON body into a JS object
6. **Loop & render** — skip empty fields, wrap each key/value in a `<div>`, inject into `resultCont`

Sample response fields you'll see: `email`, `state` (deliverable/undeliverable), `score`, `mx` (mail server exists), `disposable`, `free`, `smtp_check`.

## Try It

Save all three files, open `index.html` in a browser (VS Code Live Server works great), type an email, hit Submit:

- ✅ Real Gmail → deliverable, high score
- ❌ `test@fake.xyz` → undeliverable / low score

## Conclusion

You just built a working API-powered tool with plain HTML/CSS/JS — no frameworks. Next steps to level it up: move the API key behind your own backend (never ship keys in client code for production!), add regex pre-validation before calling the API, and style invalid states in red.

> Source: adapted from CodeWithHarry's blog — [codewithharry.com/blogpost/email-validator-using-html-css-js](https://www.codewithharry.com/blogpost/email-validator-using-html-css-js)
