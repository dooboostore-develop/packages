export const data = {
    bigHTML: `
    <!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8">
    <base href="/">
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">
    <title>dooboostore - Integrated Development Platform</title>
    <meta name="description" content="A powerful and flexible Integrated Development Platform for modern web application development">
    <meta name="keywords" content="TypeScript, JavaScript, library, framework, Simple Boot, DI, AOP, open source, web development">
    <meta name="author" content="dooboostore">

    <!-- Theme Colors -->
    <meta name="theme-color" content="#000000">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-capable" content="yes">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://dooboostore-develop.github.io/">
    <meta property="og:title" content="dooboostore - Integrated Development Platform">
    <meta property="og:description" content="A powerful and flexible Integrated Development Platform for modern web application development">
    <meta property="og:image" content="assets/images/dooboostore.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://dooboostore-develop.github.io/">
    <meta property="twitter:title" content="dooboostore - Integrated Development Platform">
    <meta property="twitter:description" content="A powerful and flexible Integrated Development Platform for modern web application development">
    <meta property="twitter:image" content="assets/images/dooboostore.png">

    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer">

    <!-- StackBlitz SDK -->
    <script src="https://unpkg.com/@stackblitz/sdk@1/bundles/sdk.umd.js"></script>
<!--    <script src="https://unpkg.com/@stackblitz/sdk/bundles/sdk.umd.js"> </script>-->

    <!-- Prism.js for code highlighting -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js" defer></script>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

        mermaid.initialize({startOnLoad: true});
        window.Mermaid = mermaid;
    </script>
    <!-- Global Styles -->
    <link rel="stylesheet" href="assets/css/global.css">

    <!-- Structured Data -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "dooboostore",
            "description": "A powerful and flexible Integrated Development Platform collection for modern web application development",
            "url": "https://dooboostore-develop.github.io/",
            "author": {
                "@type": "Organization",
                "name": "dooboostore"
            },
            "programmingLanguage": "TypeScript",
            "operatingSystem": "Cross-platform",
            "applicationCategory": "DeveloperApplication"
        }
    </script>
<script defer src="bundle.js"></script></head>
<body>

<div id="app"><meta id="dxiNIvFAiyxlYJequvANEUhheUXdyNBCgBpmdtXV-start"><style id="dxiNIvFAiyxlYJequvANEUhheUXdyNBCgBpmdtXV-style"></style><meta id="ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start"><style id="ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-style">/* Header */
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).header, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .header {
  position: sticky;
  top: 0;
  height: 64px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).header-container, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).header-left, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .header-left {
  display: flex;
  align-items: center;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).logo, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 18px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).logo-img, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .logo-img {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 4px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).logo-text, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .logo-text {
  font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).header-nav, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .header-nav {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-left: 32px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).nav-link, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  transform: translateY(0);
  box-shadow: 0 0 0 rgba(102, 126, 234, 0);
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).nav-link:hover, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .nav-link:hover {
  color: white;
  background-color: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).nav-link:active, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .nav-link:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(102, 126, 234, 0.2);
  background-color: rgba(102, 126, 234, 0.15);
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).header-right, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
/* Language Toggle */
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-toggle, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-toggle {
  position: relative;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-checkbox, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-checkbox {
  display: none;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-label, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-label {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  width: 50px;
  /* 더 작은 고정 너비 */
  min-width: 50px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-label:hover, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-label:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-text, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-text {
  transition: opacity 0.2s ease;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-text.english, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-text.english {
  display: none;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-checkbox:checked + .language-label .language-text.korean, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-checkbox:checked + .language-label .language-text.korean {
  display: none;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).language-checkbox:checked + .language-label .language-text.english, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .language-checkbox:checked + .language-label .language-text.english {
  display: inline;
}
/* Language Content Toggle */
/* .content.en { */
/* display: block; */
/* } */
/* .content.ko { */
/* display: none; */
/* } */
/* .language-checkbox:checked ~ main .content.en { */
/* display: none; */
/* } */
/* .language-checkbox:checked ~ main .content.ko { */
/* display: block; */
/* } */
/* Main Content */
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) main, #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ main:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *) {
  min-height: 100vh;
}
/* Footer */
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer {
  background: #000;
  color: white;
  padding: 20px 0 0;
  /* margin-top: 120px; */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 100;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-container, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-simple, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-simple {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  padding-bottom: 20px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-logo, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-logo {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-logo .logo-img, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-logo .logo-img {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 4px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-logo .logo-text, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-logo .logo-text {
  font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-links, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-links {
  display: flex;
  gap: 24px;
  align-items: center;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-link, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-link:hover, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-link:hover {
  color: white;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-link i, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-link i {
  font-size: 16px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-copyright, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-copyright {
  display: flex;
  align-items: center;
  gap: 8px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-logo-small, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-logo-small {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).footer-copyright p, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .footer-copyright p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).content.ko, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .content.ko {
  display: none;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).content.en, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .content.en {
  display: block;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) header:has(#language-toggle:checked) ~ * .content.ko, #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ header:has(#language-toggle:checked) ~ * .content.ko:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *), :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) header:has(#language-toggle:checked) .content.ko, #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ header:has(#language-toggle:checked) .content.ko:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *) {
  display: block;
}
:is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) header:has(#language-toggle:checked) ~ * .content.en, #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ header:has(#language-toggle:checked) ~ * .content.en:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *), :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) header:has(#language-toggle:checked) .content.en, #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ header:has(#language-toggle:checked) .content.en:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *) {
  display: none;
}
/* Mobile */
@media (max-width: 768px) {
  :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).logo-text, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .logo-text {
    display: none !important;
  }
  :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).header-nav, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .header-nav {
    display: flex;
    /* Show nav on mobile now */
    margin-left: 16px;
    /* Smaller margin on mobile */
    gap: 16px;
    /* Smaller gap on mobile */
  }
  :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).nav-link, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .nav-link {
    font-size: 13px;
    /* Slightly smaller font on mobile */
  }
  :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)).header-container, :is(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ *:not(#ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-start ~ #ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end ~ *)) .header-container {
    padding: 0 16px;
  }
  /* .footer-links { */
  /* flex-direction: column; */
  /* gap: 16px; */
  /* } */
}</style><!-- Header -->
<header class="header">
    <div class="header-container">
        <div class="header-left">
            <meta id="yvSptHsNftASdMLjeahDNdLBVmkkWtDwuqIzumXX-start"><style id="yvSptHsNftASdMLjeahDNdLBVmkkWtDwuqIzumXX-style"></style><a href="/" target="null" style="null" class="logo">
                <img src="assets/images/dooboostore.png" alt="dooboostore" class="logo-img">
                <span class="logo-text content en">dooboostore</span>
                <span class="logo-text content ko">두부가게</span>
            </a><meta id="yvSptHsNftASdMLjeahDNdLBVmkkWtDwuqIzumXX-end">

            <nav class="header-nav">
                <meta id="nzPQPLEyuyPwEisdAXYpadFBEWbygOiIXnIOCGIM-start"><style id="nzPQPLEyuyPwEisdAXYpadFBEWbygOiIXnIOCGIM-style"></style><a href="/@dooboostore" target="null" style="null" class="nav-link content en">📦 Packages</a><meta id="nzPQPLEyuyPwEisdAXYpadFBEWbygOiIXnIOCGIM-end">
                <meta id="CTJNdxYRnxMmAPAKQsjzZWqaPQpfdodJiXlojime-start"><style id="CTJNdxYRnxMmAPAKQsjzZWqaPQpfdodJiXlojime-style"></style><a href="/@dooboostore" target="null" style="null" class="nav-link content ko">📦 패키지</a><meta id="CTJNdxYRnxMmAPAKQsjzZWqaPQpfdodJiXlojime-end">
            </nav>
        </div>

        <div class="header-right">
            <!-- Language Toggle -->
            <div class="language-toggle">
                <input type="checkbox" id="language-toggle" class="language-checkbox">
                <label for="language-toggle" class="language-label">
                    <span class="language-text korean">KO</span>
                    <span class="language-text english">EN</span>
                </label>
            </div>
        </div>
    </div>
</header>

<main>
    <meta id="NuduAmIMTbgsvSiBvUYZcfcjbXPbpJOoXlOSSPHn-start"><style id="NuduAmIMTbgsvSiBvUYZcfcjbXPbpJOoXlOSSPHn-style"></style><meta id="KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start"><style id="KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-style">:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) *, #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).packages-container, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .packages-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #000;
  color: #e5e5e5;
  min-height: 100vh;
  position: relative;
}
/* Mobile Menu Toggle */
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).mobile-menu-toggle, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .mobile-menu-toggle {
  /* display: none; */
  position: fixed;
  bottom: 24px;
  left: 14px;
  z-index: 1000;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).menu-toggle-btn, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .menu-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).menu-toggle-btn:hover, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .menu-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).menu-toggle-btn span, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .menu-toggle-btn span {
  display: none;
}
/* Sidebar */
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar {
  width: 280px;
  background: #000;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 50;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-content, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-content {
  padding: 24px 0;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-section, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-section {
  margin-bottom: 8px;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-category, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-category:hover, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-category:hover {
  background: rgba(255, 255, 255, 0.05);
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).category-arrow, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .category-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).category-arrow.rotated, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .category-arrow.rotated {
  transform: rotate(180deg);
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-items, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-items {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-items.open, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-items.open {
  max-height: 500px;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-item, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-item {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  padding: 8px 24px 8px 40px;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-item:hover, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
  border-left-color: rgba(255, 255, 255, 0.3);
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar-item.active, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar-item.active {
  color: #0070f3;
  background: rgba(0, 112, 243, 0.1);
  border-left-color: #0070f3;
}
/* Main Content */
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).main-content, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .main-content {
  margin-left: 280px;
  padding: 0;
  min-height: 100vh;
}
/* Language Content Toggle */
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).content.ko, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .content.ko {
  display: none;
}
:is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).content.en, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .content.en {
  display: block;
}
/* Desktop - 사이드바 토글 가능 */
@media (min-width: 769px) {
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).mobile-menu-toggle, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .mobile-menu-toggle {
    display: block;
    position: fixed;
    bottom: 24px;
    left: 20px;
    top: auto;
    z-index: 1001;
    transition: left 0.3s ease;
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).menu-toggle-btn, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .menu-toggle-btn {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(12px);
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).menu-toggle-btn:hover, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .menu-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar {
    transform: translateX(0);
    transition: transform 0.3s ease;
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar.closed, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar.closed {
    transform: translateX(-100%);
  }
  /* 사이드바가 닫혔을 때 토글 버튼 위치는 그대로 유지 */
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar.closed ~ .mobile-menu-toggle, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar.closed ~ .mobile-menu-toggle {
    left: 20px;
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).main-content, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .main-content {
    margin-left: 280px;
    transition: margin-left 0.3s ease;
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).main-content.expanded, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .main-content.expanded {
    margin-left: 0;
  }
}
/* Mobile Responsive */
@media (max-width: 768px) {
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).packages-container, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .packages-container {
    display: block;
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).mobile-menu-toggle, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .mobile-menu-toggle {
    display: block;
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    width: 280px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 500;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(12px);
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar.open, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar.open {
    transform: translateX(0);
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).main-content, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .main-content {
    margin-left: 0;
  }
  /* Mobile overlay */
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar.open::before, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar.open::before {
    content: '';
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}
/* Tablet */
@media (max-width: 1024px) and (min-width: 769px) {
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).sidebar, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .sidebar {
    width: 240px;
  }
  :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)).main-content, :is(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ *:not(#KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-start ~ #KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end ~ *)) .main-content {
    margin-left: 240px;
  }
}</style><div class="packages-container">
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-content">
            <!-- Framework -->
            <div class="sidebar-section">
                <button class="sidebar-category">
                    <span>Framework</span>
                    <i class="fas fa-chevron-down category-arrow" id="framework-arrow"></i>
                </button>
                <div class="sidebar-items" id="framework-items">
                    <meta id="ZZUWoQBXwGmPJxaevYFHayRkEqzFqQfXRMpILQNS-start"><meta id="ipiHjhkobyjEPoEbzCUEPbPTSvKlZdwibLgOqeey-start"><style id="ipiHjhkobyjEPoEbzCUEPbPTSvKlZdwibLgOqeey-style"></style><a href="/@dooboostore/simple-boot" target="null" style="null" class="sidebar-item"><!--start text TIZnfdIFbHUFDLYYIMSMNVrwBiRgPxnmBRCRXahN_DomRenderRootObject-->simple-boot<!--end text TIZnfdIFbHUFDLYYIMSMNVrwBiRgPxnmBRCRXahN_DomRenderRootObject--></a><meta id="ipiHjhkobyjEPoEbzCUEPbPTSvKlZdwibLgOqeey-end"><meta id="kXFpWBeGKWnQeOJyePEOvFXyiNEbvFOtNMCOtuxq-start"><style id="kXFpWBeGKWnQeOJyePEOvFXyiNEbvFOtNMCOtuxq-style"></style><a href="/@dooboostore/simple-boot-front" target="null" style="null" class="sidebar-item"><!--start text gnnAdNmulikzMrXKjsiPKAiUjAPSuBunwYaIeeiw_DomRenderRootObject-->simple-boot-front<!--end text gnnAdNmulikzMrXKjsiPKAiUjAPSuBunwYaIeeiw_DomRenderRootObject--></a><meta id="kXFpWBeGKWnQeOJyePEOvFXyiNEbvFOtNMCOtuxq-end"><meta id="CvjiTaFPCNqKbmpbTjUHoDucJMBrMrvvFTCwOqhD-start"><style id="CvjiTaFPCNqKbmpbTjUHoDucJMBrMrvvFTCwOqhD-style"></style><a href="/@dooboostore/simple-boot-http-server" target="null" style="null" class="sidebar-item"><!--start text WGSfeeJmizlaIDnXFaBSgIsWyTNLpIurZfiEQVxu_DomRenderRootObject-->simple-boot-http-server<!--end text WGSfeeJmizlaIDnXFaBSgIsWyTNLpIurZfiEQVxu_DomRenderRootObject--></a><meta id="CvjiTaFPCNqKbmpbTjUHoDucJMBrMrvvFTCwOqhD-end"><meta id="PTsbznbADCYBSWkmJvWOtdGZiWTdHhxSlFStoEai-start"><style id="PTsbznbADCYBSWkmJvWOtdGZiWTdHhxSlFStoEai-style"></style><a href="/@dooboostore/simple-boot-http-server-ssr" target="null" style="null" class="sidebar-item"><!--start text xixepViXAzcCDiYUrllFWmAvBnrhojxcJbVXNgQR_DomRenderRootObject-->simple-boot-http-server-ssr<!--end text xixepViXAzcCDiYUrllFWmAvBnrhojxcJbVXNgQR_DomRenderRootObject--></a><meta id="PTsbznbADCYBSWkmJvWOtdGZiWTdHhxSlFStoEai-end"><meta id="ZZUWoQBXwGmPJxaevYFHayRkEqzFqQfXRMpILQNS-end">
                </div>
            </div>

            <!-- Library -->
            <div class="sidebar-section">
                <button class="sidebar-category">
                    <span>Library</span>
                    <i class="fas fa-chevron-down category-arrow" id="library-arrow"></i>
                </button>
                <div class="sidebar-items" id="library-items">
                    <meta id="ljmVnEpDAncwEbLejPiLmXBsuChpHhskPCNOWumF-start"><meta id="JVOzeZAJwtelaMsrpOHFucNyKLHGzpJIKDVfpVYA-start"><style id="JVOzeZAJwtelaMsrpOHFucNyKLHGzpJIKDVfpVYA-style"></style><a href="/@dooboostore/dom-render" target="null" style="null" class="sidebar-item"><!--start text rDEDqTxUFCwPBYspWizUyBmxGMPYzcoZoruiwbKo_DomRenderRootObject-->dom-render<!--end text rDEDqTxUFCwPBYspWizUyBmxGMPYzcoZoruiwbKo_DomRenderRootObject--></a><meta id="JVOzeZAJwtelaMsrpOHFucNyKLHGzpJIKDVfpVYA-end"><meta id="XbbpGkCkMaPMaPKUEPJlyWwhLHvSkJFNmNxFWhVv-start"><style id="XbbpGkCkMaPMaPKUEPJlyWwhLHvSkJFNmNxFWhVv-style"></style><a href="/@dooboostore/swt" target="null" style="null" class="sidebar-item"><!--start text ZIcGkMnoyqOCdrJWTDFCCpIbGVyCmmAYEdshMHHG_DomRenderRootObject-->swt<!--end text ZIcGkMnoyqOCdrJWTDFCCpIbGVyCmmAYEdshMHHG_DomRenderRootObject--></a><meta id="XbbpGkCkMaPMaPKUEPJlyWwhLHvSkJFNmNxFWhVv-end"><meta id="ljmVnEpDAncwEbLejPiLmXBsuChpHhskPCNOWumF-end">
                </div>
            </div>

            <!-- Core -->
            <div class="sidebar-section">
                <button class="sidebar-category">
                    <span>Core</span>
                    <i class="fas fa-chevron-down category-arrow" id="core-arrow"></i>
                </button>
                <div class="sidebar-items" id="core-items">
                    <meta id="TNdduoRIAmdekkmJZGmsPVgcWcnVRxZNyCOmlCKL-start"><meta id="SOHtJhRdqcQhRGOhDOEOYepmgOjEnTdfKkkXASFU-start"><style id="SOHtJhRdqcQhRGOhDOEOYepmgOjEnTdfKkkXASFU-style"></style><a href="/@dooboostore/core" target="null" style="null" class="sidebar-item"><!--start text ddTuoXBjTFhDJVkTchwHTycJqWNKPHhLzGZikhLR_DomRenderRootObject-->core<!--end text ddTuoXBjTFhDJVkTchwHTycJqWNKPHhLzGZikhLR_DomRenderRootObject--></a><meta id="SOHtJhRdqcQhRGOhDOEOYepmgOjEnTdfKkkXASFU-end"><meta id="TyScPPCKgSPEqRFXRzNZacDudpMqOEKJHwFDsuzP-start"><style id="TyScPPCKgSPEqRFXRzNZacDudpMqOEKJHwFDsuzP-style"></style><a href="/@dooboostore/core-node" target="null" style="null" class="sidebar-item"><!--start text NMmgHrdymhdDhVAuDnXCnrPKUtRDBavIXwIKFlHC_DomRenderRootObject-->core-node<!--end text NMmgHrdymhdDhVAuDnXCnrPKUtRDBavIXwIKFlHC_DomRenderRootObject--></a><meta id="TyScPPCKgSPEqRFXRzNZacDudpMqOEKJHwFDsuzP-end"><meta id="MAQuYftQCeJXdSyplihwnsHEfwXcmZTdQdCxtvXc-start"><style id="MAQuYftQCeJXdSyplihwnsHEfwXcmZTdQdCxtvXc-style"></style><a href="/@dooboostore/core-web" target="null" style="null" class="sidebar-item"><!--start text mfcBRkYIuSraFXbjyRSXwQXGrGqOijpLNxqZTPbB_DomRenderRootObject-->core-web<!--end text mfcBRkYIuSraFXbjyRSXwQXGrGqOijpLNxqZTPbB_DomRenderRootObject--></a><meta id="MAQuYftQCeJXdSyplihwnsHEfwXcmZTdQdCxtvXc-end"><meta id="TNdduoRIAmdekkmJZGmsPVgcWcnVRxZNyCOmlCKL-end">
                </div>
            </div>
        </div>
    </aside>

    <!-- Menu Toggle Button -->
    <div class="mobile-menu-toggle">
        <button class="menu-toggle-btn">
            <i class="fas fa-bars"></i>
            <span>Menu</span>
        </button>
    </div>

    <!-- Main Content -->
    <main class="main-content">
        <meta id="tBuzfNDYWLwCjssKjPuxFjVNuPLgZuYBFreFnAsy-start"><style id="tBuzfNDYWLwCjssKjPuxFjVNuPLgZuYBFreFnAsy-style"></style><meta id="BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start"><style id="BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-style">:is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).sub-navigation, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .sub-navigation {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 48px;
  position: sticky;
  height: 53px;
  top: 64px;
  z-index: 100;
  backdrop-filter: blur(8px);
}
:is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).breadcrumb, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
:is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).breadcrumb-item, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .breadcrumb-item {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.2s ease;
}
:is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).breadcrumb-item:hover, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .breadcrumb-item:hover {
  color: white;
}
:is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).breadcrumb-separator, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .breadcrumb-separator {
  color: rgba(255, 255, 255, 0.4);
}
:is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).breadcrumb-current, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .breadcrumb-current {
  color: white;
  font-weight: 500;
}
/* Mobile */
@media (max-width: 768px) {
  :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).sub-navigation, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .sub-navigation {
    padding: 12px 16px;
  }
  :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).breadcrumb, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .breadcrumb {
    font-size: 13px;
  }
}
/* Mobile */
@media (max-width: 768px) {
  :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)).breadcrumb, :is(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ *:not(#BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-start ~ #BuxiqoRoeaOfRmbzAgWcsDzrzKDmuykMtPiiQMMg-end ~ *)) .breadcrumb {
    font-size: 13px;
  }
}</style><div class="sub-navigation">
<meta id="bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start"><style id="bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-style">:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb {
  font-size: 0.875rem;
  color: #a0a0a0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-item, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-item {
  color: #a0a0a0;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-item:hover, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-item:hover {
  color: #ffffff;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-current, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-current {
  color: #e5e5e5;
  font-weight: 500;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-separator, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-separator {
  margin: 0 0.5rem;
  color: #606060;
  user-select: none;
}
/* Dropdown styles */
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-dropdown, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-select, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-select {
  position: relative;
  display: inline-block;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-select-summary, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-select-summary {
  cursor: pointer;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-select-body, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-select-body {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 150px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 0.5rem 0;
  margin-top: 0.25rem;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-select-option, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-select-option {
  cursor: pointer;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-option-content, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-option-content {
  padding: 0.5rem 1rem;
  color: #e5e5e5;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-option-content:hover, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-option-content:hover {
  background-color: #2a2a2a;
  color: #ffffff;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-option-content.selected, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-option-content.selected {
  background-color: #ffffff;
  color: #0a0a0a;
}
:is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-option-content.selected:hover, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-option-content.selected:hover {
  background-color: #f0f0f0;
}
/* Responsive */
@media (max-width: 768px) {
  :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb {
    font-size: 0.8rem;
  }
  :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)).breadcrumb-separator, :is(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ *:not(#bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-start ~ #bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end ~ *)) .breadcrumb-separator {
    margin: 0 0.25rem;
  }
}</style><div class="breadcrumb">
  <meta id="HOLzlkmBdeOVTfZunBiMhyBzBtUuCsOXzkcvgGvg-start"><span>
    <!-- Single item case -->
    <meta id="zvcNqvXFAJbVBfyxsENWHtpfTxGzTOuqdUzpdCUH-start"><span>
      <meta id="HjWidnTSoRwHhvyJlETMEAvvxiOzhzdwmVyOaBdE-start"><a href="/@dooboostore/core" class="breadcrumb-item">
        <!--start text JylemJhInSHMIWZtCdyCZdGMwgktLtIXiFlvqlAA_DomRenderRootObject-->core<!--end text JylemJhInSHMIWZtCdyCZdGMwgktLtIXiFlvqlAA_DomRenderRootObject-->
      </a><meta id="HjWidnTSoRwHhvyJlETMEAvvxiOzhzdwmVyOaBdE-end">
      <meta id="xUNSLXPoiOtfHHZicXMchvLeiqgxbWtXgmxGohPh-start"><meta id="xUNSLXPoiOtfHHZicXMchvLeiqgxbWtXgmxGohPh-end">
    </span><meta id="zvcNqvXFAJbVBfyxsENWHtpfTxGzTOuqdUzpdCUH-end">

    <!-- Dropdown case -->
    <meta id="OfKMDDwsPNMPCUhzeTvNomCxVQnAYIrGlLiDogEH-start"><meta id="OfKMDDwsPNMPCUhzeTvNomCxVQnAYIrGlLiDogEH-end">

    <!-- Separator -->
    <meta id="kKkDNVLvymsgUVLGeSxCSzyKvkSVDVYIeTQAjKfB-start"><span class="breadcrumb-separator">/</span><meta id="kKkDNVLvymsgUVLGeSxCSzyKvkSVDVYIeTQAjKfB-end">
  </span><span>
    <!-- Single item case -->
    <meta id="wJiYmXTlEmiNmgTzjxhNLrguLtvJVRxFsvcVaYFQ-start"><meta id="wJiYmXTlEmiNmgTzjxhNLrguLtvJVRxFsvcVaYFQ-end">

    <!-- Dropdown case -->
    <meta id="KTxDAOImMshMZxnrrtFbnebTiRkeNLbIKkGigZGr-start"><span>
      <meta id="MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start"><style id="MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-style">:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-container {
  position: relative;
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-options-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-options-container {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-container.is-open .dr-select-options-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-container.is-open .dr-select-options-container {
  display: block;
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) summary, #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ summary:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)::-webkit-details-marker {
  display: none;
}
/* Floating styles for dr-select-body */
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-body-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-body-container {
  position: absolute;
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-body-bottom-left-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-body-bottom-left-container {
  position: absolute;
  left: 0;
  top: 100%;
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-body-bottom-right-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-body-bottom-right-container {
  position: absolute;
  right: 0;
  top: 100%;
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-body-top-left-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-body-top-left-container {
  position: absolute;
  left: 0;
  bottom: 100%;
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-body-top-right-container, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-body-top-right-container {
  position: absolute;
  right: 0;
  bottom: 100%;
}
/* Reset default details/summary styles */
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-container details, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-container details {
  display: block;
  /* Ensure it behaves like a block element */
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-container summary, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-container summary {
  display: block;
  /* Ensure it behaves like a block element */
  list-style: none;
  /* Remove default marker */
  cursor: pointer;
  /* Indicate it's clickable */
}
:is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-container summary::-webkit-details-marker, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-container summary::-webkit-details-marker, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)).dr-select-container summary::marker, :is(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ *:not(#MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-start ~ #MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end ~ *)) .dr-select-container summary::marker {
  display: none;
  /* Hide marker for Webkit and standard */
}</style><details class="dr-select-container breadcrumb-select">

    
        <meta id="UfhpwZjlbDIIJeZEmYxtgqioFeglXeOEAoAzmcDM-start"><style id="UfhpwZjlbDIIJeZEmYxtgqioFeglXeOEAoAzmcDM-style"></style><summary class="breadcrumb-select-summary">

          <meta id="SMCtYxXHynkpGZmbeNdJnDgRgevjzcLRUMHbfgca-start"><style id="SMCtYxXHynkpGZmbeNdJnDgRgevjzcLRUMHbfgca-style"></style><meta id="SHAPGyDLsHuyYjQEvncQLUCJACArGbRThIwBwmpo-start">
            <span class="breadcrumb-current breadcrumb-dropdown">
              <!--start text BqhhxGxVhcQEXqvOMEuHtEqzLKWKmVxRXKGAzuMH_DomRenderRootObject-->Installation<!--end text BqhhxGxVhcQEXqvOMEuHtEqzLKWKmVxRXKGAzuMH_DomRenderRootObject--> ▼
            </span>
          <meta id="SHAPGyDLsHuyYjQEvncQLUCJACArGbRThIwBwmpo-end">
<meta id="SMCtYxXHynkpGZmbeNdJnDgRgevjzcLRUMHbfgca-end">
          <meta id="EjMsGauSuQnbersCFksGuQROMPTqhfHZkGuTKhme-start"><style id="EjMsGauSuQnbersCFksGuQROMPTqhfHZkGuTKhme-style"></style><meta id="qJCpLkinDVNUdOeGeTfbwrajPwcfFKYnpmylBclM-start"><meta id="qJCpLkinDVNUdOeGeTfbwrajPwcfFKYnpmylBclM-end">
<meta id="EjMsGauSuQnbersCFksGuQROMPTqhfHZkGuTKhme-end">
        
</summary><meta id="UfhpwZjlbDIIJeZEmYxtgqioFeglXeOEAoAzmcDM-end">

        <meta id="MmDuitlwrMVhyomopWodgbRcHofTpyQDDUmMUWCk-start"><style id="MmDuitlwrMVhyomopWodgbRcHofTpyQDDUmMUWCk-style"></style><div class="breadcrumb-select-body dr-select-body-container dr-select-body-bottom-left-container">
          <meta id="vXhEZyXAyQJaAKUPcFfimCzWCEpoceMgxGjATwjN-start"><meta id="dQoJOXCkcSsOdsFSNmqKfhxVeXWNbxmCcOgEddRO-start"><style id="dQoJOXCkcSsOdsFSNmqKfhxVeXWNbxmCcOgEddRO-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text PTpIkdYNxMOlPjHxxRJDaIhFSNcZsiTiJLQukJjM_DomRenderRootObject-->Installation<!--end text PTpIkdYNxMOlPjHxxRJDaIhFSNcZsiTiJLQukJjM_DomRenderRootObject-->
              </div>
          </a>
<meta id="dQoJOXCkcSsOdsFSNmqKfhxVeXWNbxmCcOgEddRO-end"><meta id="SCmbxBJmNNKhLAYaaAeycoQdRcOiwBGsqPBXEcpA-start"><style id="SCmbxBJmNNKhLAYaaAeycoQdRcOiwBGsqPBXEcpA-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text ZrYbkfRFpziNkAiIDVeltaxqBxMPZjwJqHUJdUcL_DomRenderRootObject-->Demo example<!--end text ZrYbkfRFpziNkAiIDVeltaxqBxMPZjwJqHUJdUcL_DomRenderRootObject-->
              </div>
          </a>
<meta id="SCmbxBJmNNKhLAYaaAeycoQdRcOiwBGsqPBXEcpA-end"><meta id="KMJRqvqWIWpkvCzGfiefqngNBwbDEveVhGQQaNRl-start"><style id="KMJRqvqWIWpkvCzGfiefqngNBwbDEveVhGQQaNRl-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text fWpfrMgxQuXHTeFZKgUTBhrjHMMuIkyhAmBFjUdH_DomRenderRootObject-->Low Level Utilities<!--end text fWpfrMgxQuXHTeFZKgUTBhrjHMMuIkyhAmBFjUdH_DomRenderRootObject-->
              </div>
          </a>
<meta id="KMJRqvqWIWpkvCzGfiefqngNBwbDEveVhGQQaNRl-end"><meta id="qQPhTVjxfmmvJHsCYyhGauiaIxgpIhGdYkPCwEAi-start"><style id="qQPhTVjxfmmvJHsCYyhGauiaIxgpIhGdYkPCwEAi-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text nRuoFVIMAxMStCnlxNHYzfDzdsYNirJwgMqyuRUK_DomRenderRootObject-->Programming Patterns<!--end text nRuoFVIMAxMStCnlxNHYzfDzdsYNirJwgMqyuRUK_DomRenderRootObject-->
              </div>
          </a>
<meta id="qQPhTVjxfmmvJHsCYyhGauiaIxgpIhGdYkPCwEAi-end"><meta id="rGAiWQSrDPDBpczKbhjluFmqFXfqxBjQvCFsqDBM-start"><style id="rGAiWQSrDPDBpczKbhjluFmqFXfqxBjQvCFsqDBM-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text noNTSPMJpNwfvIvLnkpppyMnhGVGplLZdKSeZzWr_DomRenderRootObject-->Convenience Classes<!--end text noNTSPMJpNwfvIvLnkpppyMnhGVGplLZdKSeZzWr_DomRenderRootObject-->
              </div>
          </a>
<meta id="rGAiWQSrDPDBpczKbhjluFmqFXfqxBjQvCFsqDBM-end"><meta id="jYwPLfyESjUbsCIZizhcoySsKibpZUFWzYRIecKh-start"><style id="jYwPLfyESjUbsCIZizhcoySsKibpZUFWzYRIecKh-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text njMSPmKfFoNAVuMXLonOYMUtylWMmYmEdtplgxJp_DomRenderRootObject-->Code Standards<!--end text njMSPmKfFoNAVuMXLonOYMUtylWMmYmEdtplgxJp_DomRenderRootObject-->
              </div>
          </a>
<meta id="jYwPLfyESjUbsCIZizhcoySsKibpZUFWzYRIecKh-end"><meta id="iDmJriPXanjSviyvBdaiLMOUGfVCgGAUGCOjrPcV-start"><style id="iDmJriPXanjSviyvBdaiLMOUGfVCgGAUGCOjrPcV-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text tWwPgZPJftWFnEQegniqzjRbGlDVlVvDIkGxfqob_DomRenderRootObject-->Collections<!--end text tWwPgZPJftWFnEQegniqzjRbGlDVlVvDIkGxfqob_DomRenderRootObject-->
              </div>
          </a>
<meta id="iDmJriPXanjSviyvBdaiLMOUGfVCgGAUGCOjrPcV-end"><meta id="UhaHXxJhFKBeubpYKXGiDMHMhfrfmMhevrzbYUud-start"><style id="UhaHXxJhFKBeubpYKXGiDMHMhfrfmMhevrzbYUud-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text ixqPgpdGiopKBtMIXQvyFnyTtEZFYvUuAoffDHew_DomRenderRootObject-->Managers<!--end text ixqPgpdGiopKBtMIXQvyFnyTtEZFYvUuAoffDHew_DomRenderRootObject-->
              </div>
          </a>
<meta id="UhaHXxJhFKBeubpYKXGiDMHMhfrfmMhevrzbYUud-end"><meta id="xvAQnwSlHqADQtdiveWplddrLGlGnIooUgjRKQwe-start"><style id="xvAQnwSlHqADQtdiveWplddrLGlGnIooUgjRKQwe-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text OPYzdWlGuIqHSPvviOizPwQanQNTAxJRoGvoOyju_DomRenderRootObject-->Providers<!--end text OPYzdWlGuIqHSPvviOizPwQanQNTAxJRoGvoOyju_DomRenderRootObject-->
              </div>
          </a>
<meta id="xvAQnwSlHqADQtdiveWplddrLGlGnIooUgjRKQwe-end"><meta id="IcvcIJbNmKsEiOLSlqmHPtHyGVMxxPilOGCqCTsM-start"><style id="IcvcIJbNmKsEiOLSlqmHPtHyGVMxxPilOGCqCTsM-style"></style><a class="breadcrumb-select-option">
              <div class="breadcrumb-option-content">
                <!--start text ZwTPthFrXuGZZqOtRxCJEPAvAgUzRDHyIASYlZHJ_DomRenderRootObject-->Async &amp; Promise<!--end text ZwTPthFrXuGZZqOtRxCJEPAvAgUzRDHyIASYlZHJ_DomRenderRootObject-->
              </div>
          </a>
<meta id="IcvcIJbNmKsEiOLSlqmHPtHyGVMxxPilOGCqCTsM-end"><meta id="vXhEZyXAyQJaAKUPcFfimCzWCEpoceMgxGjATwjN-end">
        </div><meta id="MmDuitlwrMVhyomopWodgbRcHofTpyQDDUmMUWCk-end">
      
</details>
<select hidden="hidden" name="null" disabled="null" style="width: 1500px; height:500px" multiple>
    <meta id="gtjIOkMKIoNaBVUztZSpMMrvFEUwNolEeTRplKQq-start"><option value="9555-f811-0cf8-1860" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[0] <!--start text XENAQhsbvrRagUVReoiJpCDtCowzCwOOYWlzHsgR_DomRenderRootObject-->9555-f811-0cf8-1860<!--end text XENAQhsbvrRagUVReoiJpCDtCowzCwOOYWlzHsgR_DomRenderRootObject--></option><option value="0106-f816-9418-172c" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[1] <!--start text oxeOUYjtgYqjfeePNhKrWYCtPNHEwLXClfNhswqa_DomRenderRootObject-->0106-f816-9418-172c<!--end text oxeOUYjtgYqjfeePNhKrWYCtPNHEwLXClfNhswqa_DomRenderRootObject--></option><option value="919b-f0dd-bf51-e012" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[2] <!--start text hFpyAxhTvOxvxguNCXDRoJmFPdSepqcRUvYdPUes_DomRenderRootObject-->919b-f0dd-bf51-e012<!--end text hFpyAxhTvOxvxguNCXDRoJmFPdSepqcRUvYdPUes_DomRenderRootObject--></option><option value="3e1c-b8ea-b66a-fe2a" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[3] <!--start text fWFwuTSLsLSlmiBByCyPbqRRTTfSYfWLZHXpebjL_DomRenderRootObject-->3e1c-b8ea-b66a-fe2a<!--end text fWFwuTSLsLSlmiBByCyPbqRRTTfSYfWLZHXpebjL_DomRenderRootObject--></option><option value="5433-6461-d763-157f" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[4] <!--start text TlVnVACsdLgmbWFnwuWYXFugPyskDpVmgltoSasV_DomRenderRootObject-->5433-6461-d763-157f<!--end text TlVnVACsdLgmbWFnwuWYXFugPyskDpVmgltoSasV_DomRenderRootObject--></option><option value="13db-825f-d8dc-96c6" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[5] <!--start text tZObyGVscmiBZTHPvnkPmwPAHNpRLtoXUtdbaJrD_DomRenderRootObject-->13db-825f-d8dc-96c6<!--end text tZObyGVscmiBZTHPvnkPmwPAHNpRLtoXUtdbaJrD_DomRenderRootObject--></option><option value="3d1f-eeea-9d2e-8b88" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[6] <!--start text jGzuECbasTznoVVcTQERdRHwNtDuncHvuZrNhUAS_DomRenderRootObject-->3d1f-eeea-9d2e-8b88<!--end text jGzuECbasTznoVVcTQERdRHwNtDuncHvuZrNhUAS_DomRenderRootObject--></option><option value="41fe-6ca5-6932-a834" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[7] <!--start text IvQlcjlXgVdijbAexkRBVzkGsXnXDAfGgYMzMBMB_DomRenderRootObject-->41fe-6ca5-6932-a834<!--end text IvQlcjlXgVdijbAexkRBVzkGsXnXDAfGgYMzMBMB_DomRenderRootObject--></option><option value="58f7-fb8f-bb40-4feb" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[8] <!--start text eWaiLsVkeAgsonPPogwPBmGHYJdpGDYulNPGCWkP_DomRenderRootObject-->58f7-fb8f-bb40-4feb<!--end text eWaiLsVkeAgsonPPogwPBmGHYJdpGDYulNPGCWkP_DomRenderRootObject--></option><option value="5f8f-2261-581b-e01c" selected="null">this.__domrender_components.MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc.options[9] <!--start text pHAvFArCjyxsbQbEwtvTdpPVeEdFyGzLVIbmtYYH_DomRenderRootObject-->5f8f-2261-581b-e01c<!--end text pHAvFArCjyxsbQbEwtvTdpPVeEdFyGzLVIbmtYYH_DomRenderRootObject--></option><meta id="gtjIOkMKIoNaBVUztZSpMMrvFEUwNolEeTRplKQq-end">
</select><meta id="MQNqfafgoTXsSlyxKdtNsxeYhpLoaihbfxdaOjQc-end">
    </span><meta id="KTxDAOImMshMZxnrrtFbnebTiRkeNLbIKkGigZGr-end">

    <!-- Separator -->
    <meta id="STnlSLsiRgbmwqEISxmPrYCKGTzRGMTGGXGeyCoA-start"><meta id="STnlSLsiRgbmwqEISxmPrYCKGTzRGMTGGXGeyCoA-end">
  </span><meta id="HOLzlkmBdeOVTfZunBiMhyBzBtUuCsOXzkcvgGvg-end">
</div><meta id="bWqVEKyBDBJDDXkQeMSRGcHFdhxuXJwQYhFSRMEe-end">
</div>

<meta id="TzrTwtoRNKeueLmUIIjQhEiySlFvYDwmcDnuLkAw-start"><style id="TzrTwtoRNKeueLmUIIjQhEiySlFvYDwmcDnuLkAw-style"></style><meta id="MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start"><style id="MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-style">:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) *, #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-container, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0a0a;
  color: #e5e5e5;
  min-height: 100vh;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).container, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
/* Header */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-header, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-header {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 3rem 0;
  border-bottom: 1px solid #2a2a2a;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-header h1, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  color: #ffffff;
  letter-spacing: -0.02em;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-actions, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-link, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-link:hover, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-link:hover {
  color: white;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-link i, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-link i {
  font-size: 16px;
}
/* Collapsible Section */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).collapsible-section, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .collapsible-section {
  /* background: #1a1a1a; */
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  margin-top: 1.5rem;
  /* margin-bottom: 1.5rem; */
  transition: all 0.3s ease;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).collapsible-section[open], :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .collapsible-section[open] {
  border-color: #3a3a3a;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).collapsible-summary, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .collapsible-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* padding: 1rem 1.5rem; */
  cursor: pointer;
  list-style: none;
  /* Remove default marker */
  /* font-size: 1.1rem; */
  /* font-weight: 500; */
  color: #ffffff;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).collapsible-summary::-webkit-details-marker, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .collapsible-summary::-webkit-details-marker {
  display: none;
  /* Hide default arrow in Chrome/Safari */
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).summary-arrow, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .summary-arrow {
  width: 0.5em;
  height: 0.5em;
  border-style: solid;
  border-color: #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  transition: transform 0.2s ease-in-out;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).collapsible-section[open] > .collapsible-summary .summary-arrow, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .collapsible-section[open] > .collapsible-summary .summary-arrow {
  transform: rotate(-135deg);
  margin-top: -0.25em;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).collapsible-content, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .collapsible-content {
  /* padding: 0 1.5rem 1.5rem 1.5rem; */
  padding: 1rem 0.5rem;
  /* color: #a0a0a0; */
  line-height: 1.6;
  /* border-top: 1px solid #2a2a2a; */
}
/* Content */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-content, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-content {
  padding: 4rem 0;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).section, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .section {
  margin-bottom: 4rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).section h2, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .section h2 {
  font-size: 1.75rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 2rem;
  padding: 1rem 0 0.5rem 0;
  border-bottom: 1px solid #2a2a2a;
  position: sticky;
  top: 100px;
  background: rgba(10, 10, 10, 0.98);
  backdrop-filter: blur(12px);
  z-index: 10;
  border-top: 1px solid transparent;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).section h3, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .section h3 {
  font-size: 1.15rem;
  font-weight: 500;
  color: #e0e0e0;
  margin: 2.5rem 0 1rem 0;
  padding-left: 1rem;
  border-left: 3px solid #3a3a3a;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).section h4, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .section h4 {
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 0.5rem;
}
/* Example Item Styles */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).example-item, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .example-item {
  margin-bottom: 3rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).example-description, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .example-description {
  margin-left: 1rem;
  margin-bottom: 0.75rem;
  color: #a0a0a0;
  line-height: 1.6;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).example-code, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .example-code {
  margin-top: 1rem;
}
/* Features Grid */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).features-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).feature-item, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .feature-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).feature-item h3, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .feature-item h3 {
  font-size: 1.1rem;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 0.75rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).feature-item p, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .feature-item p {
  color: #a0a0a0;
  line-height: 1.5;
  font-size: 0.9rem;
}
/* Modules Grid */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).modules-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).module-item, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .module-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).module-item h4, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .module-item h4 {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #ffffff;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).module-item p, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .module-item p {
  color: #a0a0a0;
  line-height: 1.5;
  font-size: 0.85rem;
}
/* Concepts Grid */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).concepts-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .concepts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).concept-item, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .concept-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).concept-item h4, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .concept-item h4 {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #ffffff;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).concept-item p, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .concept-item p {
  color: #a0a0a0;
  line-height: 1.5;
  font-size: 0.9rem;
}
/* Responsive */
@media (max-width: 768px) {
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).container, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .container {
    padding: 0 1rem;
  }
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-header, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-header {
    padding: 2rem 0;
  }
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-header h1, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-header h1 {
    font-size: 2rem;
  }
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-content, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-content {
    padding: 3rem 0;
  }
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).section, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .section {
    margin-bottom: 3rem;
  }
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).features-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .features-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).modules-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .modules-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).concepts-grid, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .concepts-grid {
    grid-template-columns: 1fr;
  }
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-actions, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-actions {
    gap: 6px;
    flex-wrap: wrap;
  }
  :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).package-link, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .package-link {
    font-size: 13px;
  }
  /* .section h2 { */
  /* top: 90px; */
  /* margin: -1rem -1rem -1rem -1rem; */
  /* padding-left: 0.5rem; */
  /* } */
}
/* Other Functions Section */
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-details, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-details {
  margin-top: 1rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-summary, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-summary {
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  letter-spacing: 0.05em;
  padding: 0.25rem 0;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-summary:hover, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-summary:hover {
  color: #888;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-summary::before, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-summary::before {
  content: '▶';
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 0.6rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-details[open] .other-functions-summary::before, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-details[open] .other-functions-summary::before {
  transform: rotate(90deg);
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-list, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-list {
  margin-top: 0.75rem;
  margin-left: 1rem;
  padding: 0;
  list-style: none;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-list li, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-list li {
  font-size: 0.75rem;
  color: #888;
  padding: 0.3rem 0;
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-list li .func-signature, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-list li .func-signature {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-list li .func-name, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-list li .func-name {
  color: #60a5fa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  background: #1a1a1a;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-list li .params, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-list li .params {
  color: #999;
  font-size: 0.7rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).other-functions-list li .desc, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .other-functions-list li .desc {
  color: #777;
  font-size: 0.7rem;
}
:is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)).stack-blitz-embed, :is(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ *:not(#MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-start ~ #MnUNgJlqikVIccJyRSKdYoTJtUDKgoNwPVMkJyBl-end ~ *)) .stack-blitz-embed {
  width: 100%;
  height: 500px;
  border: 0;
  border-radius: 4px;
  overflow: hidden;
}</style><div class="package-container">
    <div class="package-header">
        <div class="container">
            <h1>core</h1>
            <p class="content en">Essential utilities and design patterns for TypeScript/JavaScript development</p>
            <p class="content ko">TypeScript/JavaScript 개발을 위한 필수 유틸리티 및 디자인 패턴</p>
            <div class="package-actions">
                <a href="https://github.com/dooboostore-develop/packages/blob/main/@dooboostore/core" target="_blank" rel="noopener noreferrer">
                    <img src="https://img.shields.io/badge/Github-555555?style=flat&logo=github&logoColor=white" alt="GitHub">
                </a>
                <a href="https://www.npmjs.com/package/@dooboostore/core" target="_blank" rel="noopener noreferrer">
                    <img src="https://img.shields.io/badge/Npm-cc0000?style=flat&logo=npm&logoColor=white" alt="NPM">
                </a>
            </div>
        </div>
    </div>
    <div class="package-content">
        <div class="container">
            <!-- Installation -->
            <section class="section">
                <h2 id="installation">Installation</h2>
                <p class="content en">Install the package with your preferred package manager</p>
                <p class="content ko">선호하는 패키지 매니저로 패키지를 설치하세요</p>
                <meta id="jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start"><style id="jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-snippet-container, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-header, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-copy-btn, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-copy-btn:active, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-copy-btn.copied, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-tabs, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).tab-btn, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).tab-btn:hover, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).tab-btn.active, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-content, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).code-tabs, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)).tab-btn, :is(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ *:not(#jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-start ~ #jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="MTJZkDraNJqzEUywKdxpPShPBAPDqhcZvrCjVfHb-start"><meta id="MTJZkDraNJqzEUywKdxpPShPBAPDqhcZvrCjVfHb-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                    <meta id="cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start"><style id="cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)).language-type-indicator, :is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)).language-type-indicator:hover, :is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)).language-result-indicator, :is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)).language-result-indicator:hover, :is(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ *:not(#cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-start ~ #cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                        <meta id="siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start"><style id="siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)) :host, #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ :host:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *) {
  display: block;
}
:is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)).code-snippet-pre, :is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)) code, #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ code:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)).language-indicator:hover, :is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)).code-snippet-pre, :is(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ *:not(#siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-start ~ #siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-bash"><p>npm install @dooboostore/core reflect-metadata</p></code></pre><meta id="siEECnorOrdGAacdvPvjUvRhSDPcZGfStXhhQPob-end">
                    </div>
<meta id="avivSUbqOEBVGTZJbqFOQGTCegCsqCTbambtnxoo-start"><meta id="avivSUbqOEBVGTZJbqFOQGTCegCsqCTbambtnxoo-end">
<div style="display: none" class="language-type-indicator"><!--start text scMVICubnXHBUTwHtxdVtrwsMFrJCFUJfXtGrlDS_DomRenderRootObject-->text<!--end text scMVICubnXHBUTwHtxdVtrwsMFrJCFUJfXtGrlDS_DomRenderRootObject--></div><meta id="cENIjEFaIKuvkQixlHLKCehFaWDrXlSAznALIcum-end">
                    <meta id="BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start"><style id="BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)).language-type-indicator, :is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)).language-type-indicator:hover, :is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)).language-result-indicator, :is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)).language-result-indicator:hover, :is(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ *:not(#BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-start ~ #BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                        <meta id="tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start"><style id="tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)) :host, #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ :host:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *) {
  display: block;
}
:is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)).code-snippet-pre, :is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)) code, #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ code:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)).language-indicator:hover, :is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)).code-snippet-pre, :is(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ *:not(#tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-start ~ #tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-bash"><p>pnpm add @dooboostore/core reflect-metadata</p></code></pre><meta id="tjAmBLTCmjXSowsobPKRKOZDZRtlczozcgebohGQ-end">
                    </div>
<meta id="HuETCSfiTXuOvLQFGfcRUgootWVszcObhayHIHzb-start"><meta id="HuETCSfiTXuOvLQFGfcRUgootWVszcObhayHIHzb-end">
<div style="display: none" class="language-type-indicator"><!--start text GEIXnwVKiprdthQdCltEAhyAnNKYuieMKcqsIQzT_DomRenderRootObject-->text<!--end text GEIXnwVKiprdthQdCltEAhyAnNKYuieMKcqsIQzT_DomRenderRootObject--></div><meta id="BlTYAkSgEqgxCZVVixoHpamaZtpZEZNcdkivrNvl-end">
                
    </div>
</div><meta id="jeiOZzaQfYhbwOocdTOBkMgHBetXyAYbzFdhGQGh-end">
            </section>
            <section class="section">
                <h2 id="demo">Demo example</h2>
                <details class="other-functions-details">
                    <summary class="other-functions-summary">
                        <p class="content en">DEMO EXAMPLE</p>
                        <p class="content ko">데모 예제</p>
                    </summary>
                    <!--                <iframe  style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;" src="https://stackblitz.com/edit/stackblitz-starters-kdmysfxl?embed=1&file=package.json"></iframe>-->
                    <!--                <iframe  style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;" src="https://stackblitz.com/edit/vitejs-vite-udkm3vaw?embed=1&file=index.html"></iframe>-->
                    <div id="example-project" class="stack-blitz-embed"></div>
                </details>
            </section>

            <!-- Low Level Utilities -->
            <section class="section">
                <h2 id="low-level-utilities">Low Level Utilities</h2>
                <p class="content en">Essential utility functions for common programming tasks</p>
                <p class="content ko">일반적인 프로그래밍 작업을 위한 필수 유틸리티 함수</p>

                <!-- ArrayUtils -->
                <div class="example-item">
                    <h3 id="array-utils">ArrayUtils</h3>
                    <p class="example-description content en">Comprehensive array manipulation utilities including 2D arrays, shuffling, and set operations</p>
                    <p class="example-description content ko">2D 배열, 셔플링, 집합 연산을 포함한 포괄적인 배열 조작 유틸리티</p>
                    <div class="example-code">
                        <meta id="IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start"><style id="IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-snippet-container, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-header, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-copy-btn, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-copy-btn:active, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-copy-btn.copied, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-tabs, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).tab-btn, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).tab-btn:hover, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).tab-btn.active, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-content, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).code-tabs, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)).tab-btn, :is(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ *:not(#IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-start ~ #IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="qLazUbNgedCZtBorkvSoCIgguIjuJvHPPuIxtByn-start"><meta id="qLazUbNgedCZtBorkvSoCIgguIjuJvHPPuIxtByn-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start"><style id="IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)).language-type-indicator, :is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)).language-type-indicator:hover, :is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)).language-result-indicator, :is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)).language-result-indicator:hover, :is(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ *:not(#IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-start ~ #IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start"><style id="yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)) :host, #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ :host:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *) {
  display: block;
}
:is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)).code-snippet-pre, :is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)) code, #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ code:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)).language-indicator:hover, :is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)).code-snippet-pre, :is(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ *:not(#yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-start ~ #yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { ArrayUtils } from '@dooboostore/core/array/ArrayUtils';

// Shuffle array
const shuffled = ArrayUtils.shuffle([1, 2, 3, 4, 5]);

// Create 2D array
const matrix = ArrayUtils.create2DArray(3, 3, 0);

// Set operations
const union = ArrayUtils.union([1, 2], [2, 3]); // [1, 2, 3]
const intersection = ArrayUtils.intersection([1, 2], [2, 3]); // [2]</p></code></pre><meta id="yhAegUPdlWmMCJLjAgjQEpsbEppQyqwunTcRDspQ-end">
                            </div>
<meta id="WwVVOZAlpgzBBjdIPTLeGnIqsWFqxgJgyBqTNYqR-start"><meta id="WwVVOZAlpgzBBjdIPTLeGnIqsWFqxgJgyBqTNYqR-end">
<div style="display: none" class="language-type-indicator"><!--start text biNIRsSTbXzWCopaDffTIHbTXKKeGxgUeWuZvOhq_DomRenderRootObject-->text<!--end text biNIRsSTbXzWCopaDffTIHbTXKKeGxgUeWuZvOhq_DomRenderRootObject--></div><meta id="IMtbVuBzfdktDIDVVIEaMDfRmvqpLIolwULlCVqy-end">
                        
    </div>
</div><meta id="IJlXVQvqmwTFXaBKiabYjxlUDreVSihMMbvFFZdH-end">
                    </div>
                    <details class="other-functions-details">
                        <summary class="other-functions-summary">
                            <span class="content en">OTHER FUNCTIONS</span>
                            <span class="content ko">기타 함수</span>
                        </summary>
                        <ul class="other-functions-list">
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">shuffle</code><span class="params">&lt;T&gt;(array: T[]): T[]</span>
                                </span>
                                <span class="desc content en">Randomly shuffle array elements</span>
                                <span class="desc content ko">배열 요소를 무작위로 섞기</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">create2DArray</code><span class="params">&lt;T&gt;(rows: number, cols: number, defaultValue: T): T[][]</span>
                                </span>
                                <span class="desc content en">Create 2D array with default values</span>
                                <span class="desc content ko">기본값으로 2D 배열 생성</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">union</code><span class="params">&lt;T&gt;(arr1: T[], arr2: T[]): T[]</span>
                                </span>
                                <span class="desc content en">Union of two arrays</span>
                                <span class="desc content ko">두 배열의 합집합</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">intersection</code><span class="params">&lt;T&gt;(arr1: T[], arr2: T[]): T[]</span>
                                </span>
                                <span class="desc content en">Intersection of two arrays</span>
                                <span class="desc content ko">두 배열의 교집합</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">difference</code><span class="params">&lt;T&gt;(arr1: T[], arr2: T[]): T[]</span>
                                </span>
                                <span class="desc content en">Difference of two arrays</span>
                                <span class="desc content ko">두 배열의 차집합</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">unique</code><span class="params">&lt;T&gt;(array: T[]): T[]</span>
                                </span>
                                <span class="desc content en">Remove duplicate elements</span>
                                <span class="desc content ko">중복 요소 제거</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">chunk</code><span class="params">&lt;T&gt;(array: T[], size: number): T[][]</span>
                                </span>
                                <span class="desc content en">Split array into chunks</span>
                                <span class="desc content ko">배열을 청크로 분할</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">flatten</code><span class="params">&lt;T&gt;(array: any[]): T[]</span>
                                </span>
                                <span class="desc content en">Flatten nested arrays</span>
                                <span class="desc content ko">중첩 배열 평탄화</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">groupBy</code><span class="params">&lt;T&gt;(array: T[], key: keyof T | ((item: T) =&gt; any)): Record&lt;string, T[]&gt;</span>
                                </span>
                                <span class="desc content en">Group array by key</span>
                                <span class="desc content ko">키로 배열 그룹화</span>
                            </li>
                        </ul>
                    </details>
                </div>

                <!-- StringUtils -->
                <div class="example-item">
                    <h3 id="string-utils">StringUtils</h3>
                    <p class="example-description content en">Advanced string manipulation including trimming, padding, emoji handling, and Korean postposition</p>
                    <p class="example-description content ko">트리밍, 패딩, 이모지 처리, 한글 조사 처리를 포함한 고급 문자열 조작</p>
                    <div class="example-code">
                        <meta id="uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start"><style id="uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-snippet-container, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-header, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-copy-btn, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-copy-btn:active, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-copy-btn.copied, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-tabs, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).tab-btn, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).tab-btn:hover, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).tab-btn.active, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-content, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).code-tabs, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)).tab-btn, :is(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ *:not(#uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-start ~ #uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="QhRCgOwQwtyGPMchExesLmxNyPsnSQchvrpTuqVL-start"><meta id="QhRCgOwQwtyGPMchExesLmxNyPsnSQchvrpTuqVL-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start"><style id="GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)).language-type-indicator, :is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)).language-type-indicator:hover, :is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)).language-result-indicator, :is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)).language-result-indicator:hover, :is(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ *:not(#GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-start ~ #GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start"><style id="KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)) :host, #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ :host:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *) {
  display: block;
}
:is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)).code-snippet-pre, :is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)) code, #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ code:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)).language-indicator:hover, :is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)).code-snippet-pre, :is(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ *:not(#KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-start ~ #KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { StringUtils } from '@dooboostore/core/string/StringUtils';

// Korean postposition
const text = StringUtils.withPostposition('사과', '을/를'); // '사과를'

// Padding
const padded = StringUtils.padLeft('42', 5, '0'); // '00042'

// Emoji handling
const length = StringUtils.lengthWithEmoji('Hello 😀'); // 7</p></code></pre><meta id="KiOzogToCYHcUetbTFItFzHgKPEHsDpRdCHWCSPn-end">
                            </div>
<meta id="adVjBQnEQfXIipBndRoXhdBSLlxKSnnuayKGqTGH-start"><meta id="adVjBQnEQfXIipBndRoXhdBSLlxKSnnuayKGqTGH-end">
<div style="display: none" class="language-type-indicator"><!--start text nRxNCFlXtUFEMPiOdlqmWModdBujwuUJWhEqKmrr_DomRenderRootObject-->text<!--end text nRxNCFlXtUFEMPiOdlqmWModdBujwuUJWhEqKmrr_DomRenderRootObject--></div><meta id="GAZeMrBHcgjvAljTvWHeLxrtfzeqXnJIDNMXepIA-end">
                        
    </div>
</div><meta id="uaHbHtZskpZERAsTMPBlivGzPgybHwDLSUznRfdE-end">
                    </div>
                    <details class="other-functions-details">
                        <summary class="other-functions-summary">
                            <span class="content en">OTHER FUNCTIONS</span>
                            <span class="content ko">기타 함수</span>
                        </summary>
                        <ul class="other-functions-list">
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">withPostposition</code><span class="params">(word: string, postposition: string): string</span>
                                </span>
                                <span class="desc content en">Add Korean postposition (을/를, 이/가, etc.)</span>
                                <span class="desc content ko">한글 조사 추가 (을/를, 이/가 등)</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">padLeft</code><span class="params">(str: string, length: number, char: string): string</span>
                                </span>
                                <span class="desc content en">Pad string on the left</span>
                                <span class="desc content ko">문자열 왼쪽에 패딩 추가</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">padRight</code><span class="params">(str: string, length: number, char: string): string</span>
                                </span>
                                <span class="desc content en">Pad string on the right</span>
                                <span class="desc content ko">문자열 오른쪽에 패딩 추가</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">lengthWithEmoji</code><span class="params">(str: string): number</span>
                                </span>
                                <span class="desc content en">Calculate string length including emojis</span>
                                <span class="desc content ko">이모지 포함 문자열 길이 계산</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">trim</code><span class="params">(str: string): string</span>
                                </span>
                                <span class="desc content en">Trim whitespace from both ends</span>
                                <span class="desc content ko">양쪽 공백 제거</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">trimLeft</code><span class="params">(str: string): string</span>
                                </span>
                                <span class="desc content en">Trim whitespace from left</span>
                                <span class="desc content ko">왼쪽 공백 제거</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">trimRight</code><span class="params">(str: string): string</span>
                                </span>
                                <span class="desc content en">Trim whitespace from right</span>
                                <span class="desc content ko">오른쪽 공백 제거</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">capitalize</code><span class="params">(str: string): string</span>
                                </span>
                                <span class="desc content en">Capitalize first letter</span>
                                <span class="desc content ko">첫 글자 대문자화</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">camelCase</code><span class="params">(str: string): string</span>
                                </span>
                                <span class="desc content en">Convert to camelCase</span>
                                <span class="desc content ko">카멜케이스로 변환</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">snakeCase</code><span class="params">(str: string): string</span>
                                </span>
                                <span class="desc content en">Convert to snake_case</span>
                                <span class="desc content ko">스네이크케이스로 변환</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">kebabCase</code><span class="params">(str: string): string</span>
                                </span>
                                <span class="desc content en">Convert to kebab-case</span>
                                <span class="desc content ko">케밥케이스로 변환</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">truncate</code><span class="params">(str: string, length: number, suffix?: string): string</span>
                                </span>
                                <span class="desc content en">Truncate string with suffix</span>
                                <span class="desc content ko">접미사와 함께 문자열 자르기</span>
                            </li>
                        </ul>
                    </details>
                </div>

                <!-- ObjectUtils -->
                <div class="example-item">
                    <h3 id="object-utils">ObjectUtils</h3>
                    <p class="example-description content en">Object manipulation utilities including deep copy, path operations, script evaluation, and path detection</p>
                    <p class="example-description content ko">깊은 복사, 경로 연산, 스크립트 평가, 경로 감지를 포함한 객체 조작 유틸리티</p>
                    <div class="example-code">
                        <meta id="JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start"><style id="JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-snippet-container, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-header, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-copy-btn, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-copy-btn:active, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-copy-btn.copied, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-tabs, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).tab-btn, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).tab-btn:hover, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).tab-btn.active, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-content, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).code-tabs, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)).tab-btn, :is(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ *:not(#JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-start ~ #JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="LKfVgHMEJEjbeYCognaRqGRFNWvixncOLzQnZTmE-start"><meta id="LKfVgHMEJEjbeYCognaRqGRFNWvixncOLzQnZTmE-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start"><style id="HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)).language-type-indicator, :is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)).language-type-indicator:hover, :is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)).language-result-indicator, :is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)).language-result-indicator:hover, :is(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ *:not(#HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-start ~ #HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start"><style id="GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)) :host, #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ :host:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *) {
  display: block;
}
:is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)).code-snippet-pre, :is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)) code, #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ code:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)).language-indicator:hover, :is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)).code-snippet-pre, :is(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ *:not(#GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-start ~ #GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';

// Deep copy
const original = { a: { b: 1 } };
const copied = ObjectUtils.deepCopy(original);

// Path operations
const value = ObjectUtils.getByPath(obj, 'user.address.city');
ObjectUtils.setByPath(obj, 'user.name', 'John');

// Script evaluation
const result = ObjectUtils.evalScript('a + b', { a: 1, b: 2 }); // 3</p></code></pre><meta id="GlltrnYgGqoiIaJvmnDjzDcMMdcClYPWXKfRJqPE-end">
                            </div>
<meta id="wTYwQbuRZAXCPVGetYuWhLrmsHJNXnNsPNkyzXAp-start"><meta id="wTYwQbuRZAXCPVGetYuWhLrmsHJNXnNsPNkyzXAp-end">
<div style="display: none" class="language-type-indicator"><!--start text zWDIgTJryLZxlbaKGhZdKpUshEMQYWumGyLJFBbC_DomRenderRootObject-->text<!--end text zWDIgTJryLZxlbaKGhZdKpUshEMQYWumGyLJFBbC_DomRenderRootObject--></div><meta id="HVFnAHgVlhJnIXHtpCAUFSyxeclwzZNctAKYdAZM-end">
                        
    </div>
</div><meta id="JRqpWegsqekZVWranipvWMFuGGMzXFkJHBLPTnCT-end">
                    </div>
                    <details class="other-functions-details">
                        <summary class="other-functions-summary">
                            <span class="content en">OTHER FUNCTIONS</span>
                            <span class="content ko">기타 함수</span>
                        </summary>
                        <ul class="other-functions-list">
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">deepCopy</code><span class="params">&lt;T&gt;(obj: T): T</span>
                                </span>
                                <span class="desc content en">Create deep copy of object</span>
                                <span class="desc content ko">객체의 깊은 복사 생성</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">getByPath</code><span class="params">(obj: any, path: string): any</span>
                                </span>
                                <span class="desc content en">Get value by dot notation path</span>
                                <span class="desc content ko">점 표기법 경로로 값 가져오기</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">setByPath</code><span class="params">(obj: any, path: string, value: any): void</span>
                                </span>
                                <span class="desc content en">Set value by dot notation path</span>
                                <span class="desc content ko">점 표기법 경로로 값 설정</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">hasPath</code><span class="params">(obj: any, path: string): boolean</span>
                                </span>
                                <span class="desc content en">Check if path exists</span>
                                <span class="desc content ko">경로 존재 여부 확인</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">deletePath</code><span class="params">(obj: any, path: string): boolean</span>
                                </span>
                                <span class="desc content en">Delete path from object</span>
                                <span class="desc content ko">객체에서 경로 삭제</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">evalScript</code><span class="params">(script: string, context: Record&lt;string, any&gt;): any</span>
                                </span>
                                <span class="desc content en">Evaluate script in context</span>
                                <span class="desc content ko">컨텍스트에서 스크립트 평가</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">merge</code><span class="params">&lt;T&gt;(target: T, ...sources: Partial&lt;T&gt;[]): T</span>
                                </span>
                                <span class="desc content en">Deep merge objects</span>
                                <span class="desc content ko">객체 깊은 병합</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">pick</code><span class="params">&lt;T, K extends keyof T&gt;(obj: T, keys: K[]): Pick&lt;T, K&gt;</span>
                                </span>
                                <span class="desc content en">Pick properties from object</span>
                                <span class="desc content ko">객체에서 속성 선택</span>
                            </li>
                            <li>
                                <span class="func-signature">
                                    <code class="func-name">omit</code><span class="params">&lt;T, K extends keyof T&gt;(obj: T, keys: K[]): Omit&lt;T, K&gt;</span>
                                </span>
                                <span class="desc content en">Omit properties from object</span>
                                <span class="desc content ko">객체에서 속성 제외</span>
                            </li>
                        </ul>
                    </details>
                </div>

                <!-- ConvertUtils -->
                <div class="example-item">
                    <h3 id="convert-utils">ConvertUtils</h3>
                    <p class="example-description content en">Utilities for converting data between different formats and types</p>
                    <p class="example-description content ko">다양한 형식과 타입 간 데이터 변환 유틸리티</p>
                    <div class="example-code">
                        <meta id="xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start"><style id="xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-snippet-container, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-header, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-copy-btn, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-copy-btn:active, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-copy-btn.copied, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-tabs, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).tab-btn, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).tab-btn:hover, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).tab-btn.active, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-content, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).code-tabs, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)).tab-btn, :is(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ *:not(#xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-start ~ #xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="hufhCiTJeiGKqniXUFGkNKhIliyPGHTLcnbPFsxZ-start"><meta id="hufhCiTJeiGKqniXUFGkNKhIliyPGHTLcnbPFsxZ-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start"><style id="KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)).language-type-indicator, :is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)).language-type-indicator:hover, :is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)).language-result-indicator, :is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)).language-result-indicator:hover, :is(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ *:not(#KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-start ~ #KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start"><style id="OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)) :host, #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ :host:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *) {
  display: block;
}
:is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)).code-snippet-pre, :is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)) code, #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ code:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)).language-indicator:hover, :is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)).code-snippet-pre, :is(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ *:not(#OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-start ~ #OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';

// Base64 encoding/decoding
const encoded = ConvertUtils.toBase64('Hello');
const decoded = ConvertUtils.fromBase64(encoded);

// JSON operations
const json = ConvertUtils.toJSON({ name: 'John' });
const obj = ConvertUtils.fromJSON(json);

// Type conversions
const num = ConvertUtils.toNumber('42'); // 42
const bool = ConvertUtils.toBoolean('true'); // true</p></code></pre><meta id="OkJocBqYNCRHogRuKRgrntuxydntaACAJRLRmTmW-end">
                            </div>
<meta id="iaFwgEJTzYjrzjlOVeHohfzanIiZHYRlndLmFrDg-start"><meta id="iaFwgEJTzYjrzjlOVeHohfzanIiZHYRlndLmFrDg-end">
<div style="display: none" class="language-type-indicator"><!--start text ljXvPrBvXkkjAAjFKWysXXEVzRZtbUKDTqQwDJnD_DomRenderRootObject-->text<!--end text ljXvPrBvXkkjAAjFKWysXXEVzRZtbUKDTqQwDJnD_DomRenderRootObject--></div><meta id="KmDuiOKOmwEcRBKKmrmWKrnAItMpKmYboDLqxGAf-end">
                        
    </div>
</div><meta id="xruCEjumFeYdKFRjbQGofNpyVIcjKqUGhzsftuZq-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">toBase64</code><span class="params">(str: string): string</span>
                </span>
                <span class="desc content en">Encode string to Base64</span>
                <span class="desc content ko">Encode string to Base64</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">fromBase64</code><span class="params">(str: string): string</span>
                </span>
                <span class="desc content en">Decode Base64 string</span>
                <span class="desc content ko">Decode Base64 string</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toJSON</code><span class="params">(obj: any): string</span>
                </span>
                <span class="desc content en">Convert object to JSON string</span>
                <span class="desc content ko">객체를 JSON 문자열로 변환</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">fromJSON&lt;T&gt;</code><span class="params">(json: string): T</span>
                </span>
                <span class="desc content en">Parse JSON string to object</span>
                <span class="desc content ko">Parse JSON string to object</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toNumber</code><span class="params">(value: any): number</span>
                </span>
                <span class="desc content en">Convert value to number</span>
                <span class="desc content ko">Convert value to number</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toBoolean</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Convert value to boolean</span>
                <span class="desc content ko">Convert value to boolean</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toString</code><span class="params">(value: any): string</span>
                </span>
                <span class="desc content en">Convert value to string</span>
                <span class="desc content ko">Convert value to string</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toArray&lt;T&gt;</code><span class="params">(value: T | T[]): T[]</span>
                </span>
                <span class="desc content en">Convert value to array</span>
                <span class="desc content ko">Convert value to array</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">hexToRgb</code><span class="params">(hex: string): { r: number, g: number, b: number }</span>
                </span>
                <span class="desc content en">Convert hex color to RGB</span>
                <span class="desc content ko">16진수 색상을 RGB로 변환</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">rgbToHex</code><span class="params">(r: number, g: number, b: number): string</span>
                </span>
                <span class="desc content en">Convert RGB to hex color</span>
                <span class="desc content ko">RGB를 16진수 색상으로 변환</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- FunctionUtils -->
                <div class="example-item">
                    <h3 id="function-utils">FunctionUtils</h3>
                    <p class="example-description content en">Utilities for function manipulation and higher-order functions</p>
                    <p class="example-description content ko">함수 조작 및 고차 함수를 위한 유틸리티</p>
                    <div class="example-code">
                        <meta id="oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start"><style id="oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-snippet-container, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-header, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-copy-btn, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-copy-btn:active, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-copy-btn.copied, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-tabs, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).tab-btn, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).tab-btn:hover, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).tab-btn.active, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-content, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).code-tabs, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)).tab-btn, :is(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ *:not(#oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-start ~ #oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="AxnZQHWciwrhoMYczUeZJKKfSDgsIIndmfLgQGMb-start"><meta id="AxnZQHWciwrhoMYczUeZJKKfSDgsIIndmfLgQGMb-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start"><style id="CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)).language-type-indicator, :is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)).language-type-indicator:hover, :is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)).language-result-indicator, :is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)).language-result-indicator:hover, :is(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ *:not(#CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-start ~ #CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start"><style id="ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)) :host, #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ :host:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *) {
  display: block;
}
:is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)).code-snippet-pre, :is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)) code, #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ code:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)).language-indicator:hover, :is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)).code-snippet-pre, :is(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ *:not(#ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-start ~ #ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';

// Debounce
const debounced = FunctionUtils.debounce(() =&amp;gt; console.log('Called'), 300);

// Throttle
const throttled = FunctionUtils.throttle(() =&amp;gt; console.log('Called'), 1000);

// Memoize
const memoized = FunctionUtils.memoize((n: number) =&amp;gt; n * 2);

// Once
const once = FunctionUtils.once(() =&amp;gt; console.log('Only once'));</p></code></pre><meta id="ArVgcYoszgyBwqQpAKWDcnNHkmMybAxKTzMlhmAR-end">
                            </div>
<meta id="TCmajOOOWIoDMfNGkZvoPzEckSrhPfgJGyDtotQC-start"><meta id="TCmajOOOWIoDMfNGkZvoPzEckSrhPfgJGyDtotQC-end">
<div style="display: none" class="language-type-indicator"><!--start text hbJMDXsVBMeJMOlZESMINQIjaoKzcBQfrdvikggg_DomRenderRootObject-->text<!--end text hbJMDXsVBMeJMOlZESMINQIjaoKzcBQfrdvikggg_DomRenderRootObject--></div><meta id="CfkqvnDmRUCNGSRcUivEPXgSeONcTcdlVnHlAUaP-end">
                        
    </div>
</div><meta id="oUJOMBqIcZiJZjUZgBjfIFFbxmnuLjVBQPbBNEKj-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">debounce&lt;T extends</code><span class="params">(...args: any[]) =&gt; any&gt;(fn: T, delay: number): T</span>
                </span>
                <span class="desc content en">Debounce function calls</span>
                <span class="desc content ko">Debounce function calls</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">throttle&lt;T extends</code><span class="params">(...args: any[]) =&gt; any&gt;(fn: T, limit: number): T</span>
                </span>
                <span class="desc content en">Throttle function calls</span>
                <span class="desc content ko">Throttle function calls</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">memoize&lt;T extends</code><span class="params">(...args: any[]) =&gt; any&gt;(fn: T): T</span>
                </span>
                <span class="desc content en">Memoize function results</span>
                <span class="desc content ko">함수 결과 메모이제이션</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">once&lt;T extends</code><span class="params">(...args: any[]) =&gt; any&gt;(fn: T): T</span>
                </span>
                <span class="desc content en">Execute function only once</span>
                <span class="desc content ko">함수를 한 번만 실행</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">curry&lt;T extends</code><span class="params">(...args: any[]) =&gt; any&gt;(fn: T): any</span>
                </span>
                <span class="desc content en">Curry function</span>
                <span class="desc content ko">함수 커링</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">compose&lt;T&gt;</code><span class="params">(...fns: Function[]): (arg: T) =&gt; any</span>
                </span>
                <span class="desc content en">Compose functions right-to-left</span>
                <span class="desc content ko">Compose functions right-to-left</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">pipe&lt;T&gt;</code><span class="params">(...fns: Function[]): (arg: T) =&gt; any</span>
                </span>
                <span class="desc content en">Pipe functions left-to-right</span>
                <span class="desc content ko">Pipe functions left-to-right</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">partial&lt;T extends</code><span class="params">(...args: any[]) =&gt; any&gt;(fn: T, ...args: any[]): T</span>
                </span>
                <span class="desc content en">Partial application</span>
                <span class="desc content ko">Partial application</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- MathUtil -->
                <div class="example-item">
                    <h3 id="math-util">MathUtil</h3>
                    <p class="example-description content en">Mathematical operations and calculations utilities</p>
                    <p class="example-description content ko">수학 연산 및 계산 유틸리티</p>
                    <div class="example-code">
                        <meta id="IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start"><style id="IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-snippet-container, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-header, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-copy-btn, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-copy-btn:active, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-copy-btn.copied, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-tabs, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).tab-btn, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).tab-btn:hover, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).tab-btn.active, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-content, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).code-tabs, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)).tab-btn, :is(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ *:not(#IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-start ~ #IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="hdukkUuPjZTpSpewQebOnHKHlLlMOBjdthYMtusN-start"><meta id="hdukkUuPjZTpSpewQebOnHKHlLlMOBjdthYMtusN-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start"><style id="bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)).language-type-indicator, :is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)).language-type-indicator:hover, :is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)).language-result-indicator, :is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)).language-result-indicator:hover, :is(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ *:not(#bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-start ~ #bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start"><style id="omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)) :host, #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ :host:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *) {
  display: block;
}
:is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)).code-snippet-pre, :is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)) code, #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ code:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)).language-indicator:hover, :is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)).code-snippet-pre, :is(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ *:not(#omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-start ~ #omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { MathUtil } from '@dooboostore/core/math/MathUtil';

// Clamp value
const clamped = MathUtil.clamp(15, 0, 10); // 10

// Linear interpolation
const lerp = MathUtil.lerp(0, 100, 0.5); // 50

// Random integer
const random = MathUtil.randomInt(1, 100);

// Round to decimal places
const rounded = MathUtil.round(3.14159, 2); // 3.14</p></code></pre><meta id="omLpWptKVJmRJSxKKJZRgIiMcjoKfCyKlJEsmbxe-end">
                            </div>
<meta id="ZKMVUrlnnQWQJzYapmguhxGVeKBzdrhZElxynCXI-start"><meta id="ZKMVUrlnnQWQJzYapmguhxGVeKBzdrhZElxynCXI-end">
<div style="display: none" class="language-type-indicator"><!--start text GvaZcWRvoiCZqymWYtzcItiikYGwPvQeCzkJdDIw_DomRenderRootObject-->text<!--end text GvaZcWRvoiCZqymWYtzcItiikYGwPvQeCzkJdDIw_DomRenderRootObject--></div><meta id="bBMfJhlTEprFsYbxCdiFDLzOqwJqewzkKILlODMz-end">
                        
    </div>
</div><meta id="IAffpsbwDvTZWgLElDMqbWfhjcUoHgUwHHHteWgM-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">clamp</code><span class="params">(value: number, min: number, max: number): number</span>
                </span>
                <span class="desc content en">Clamp value between min and max</span>
                <span class="desc content ko">값을 최소/최대 범위로 제한</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">lerp</code><span class="params">(start: number, end: number, t: number): number</span>
                </span>
                <span class="desc content en">Linear interpolation</span>
                <span class="desc content ko">선형 보간</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">randomInt</code><span class="params">(min: number, max: number): number</span>
                </span>
                <span class="desc content en">Random integer in range</span>
                <span class="desc content ko">범위 내 무작위 정수</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">round</code><span class="params">(value: number, decimals: number): number</span>
                </span>
                <span class="desc content en">Round to decimal places</span>
                <span class="desc content ko">소수점 자리수로 반올림</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toRadians</code><span class="params">(degrees: number): number</span>
                </span>
                <span class="desc content en">Convert degrees to radians</span>
                <span class="desc content ko">도를 라디안으로 변환</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toDegrees</code><span class="params">(radians: number): number</span>
                </span>
                <span class="desc content en">Convert radians to degrees</span>
                <span class="desc content ko">라디안을 도로 변환</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">average</code><span class="params">(...numbers: number[]): number</span>
                </span>
                <span class="desc content en">Calculate average</span>
                <span class="desc content ko">평균 계산</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">sum</code><span class="params">(...numbers: number[]): number</span>
                </span>
                <span class="desc content en">Calculate sum</span>
                <span class="desc content ko">합계 계산</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">max</code><span class="params">(...numbers: number[]): number</span>
                </span>
                <span class="desc content en">Find maximum</span>
                <span class="desc content ko">Find maximum</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">min</code><span class="params">(...numbers: number[]): number</span>
                </span>
                <span class="desc content en">Find minimum</span>
                <span class="desc content ko">Find minimum</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- DateUtils -->
                <div class="example-item">
                    <h3 id="date-utils">DateUtils</h3>
                    <p class="example-description content en">Date formatting, parsing, and manipulation utilities</p>
                    <p class="example-description content ko">날짜 포맷팅, 파싱 및 조작 유틸리티</p>
                    <div class="example-code">
                        <meta id="YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start"><style id="YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-snippet-container, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-header, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-copy-btn, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-copy-btn:active, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-copy-btn.copied, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-tabs, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).tab-btn, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).tab-btn:hover, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).tab-btn.active, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-content, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).code-tabs, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)).tab-btn, :is(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ *:not(#YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-start ~ #YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="TpolptlxlpCLiPSkthuVLrSqbzREEKjMldisBBPe-start"><meta id="TpolptlxlpCLiPSkthuVLrSqbzREEKjMldisBBPe-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start"><style id="sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)).language-type-indicator, :is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)).language-type-indicator:hover, :is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)).language-result-indicator, :is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)).language-result-indicator:hover, :is(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ *:not(#sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-start ~ #sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start"><style id="bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)) :host, #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ :host:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *) {
  display: block;
}
:is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)).code-snippet-pre, :is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)) code, #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ code:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)).language-indicator:hover, :is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)).code-snippet-pre, :is(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ *:not(#bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-start ~ #bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { DateUtils } from '@dooboostore/core/date/DateUtils';

// Format date
const formatted = DateUtils.format(new Date(), 'YYYY-MM-DD');

// Add days
const tomorrow = DateUtils.addDays(new Date(), 1);

// Difference in days
const diff = DateUtils.diffInDays(date1, date2);

// Is same day
const same = DateUtils.isSameDay(new Date(), new Date());</p></code></pre><meta id="bAfDvkNlrHBfcUDrCwGCCKNeZSzskbNDTeOjiifk-end">
                            </div>
<meta id="aHblQHyeWRptifCFbJshnjEdGWuZBQRwRcpFMJGq-start"><meta id="aHblQHyeWRptifCFbJshnjEdGWuZBQRwRcpFMJGq-end">
<div style="display: none" class="language-type-indicator"><!--start text TLtcmNRxDohqJRJaUZxVSGnOfvonDSRibRAUgmbG_DomRenderRootObject-->text<!--end text TLtcmNRxDohqJRJaUZxVSGnOfvonDSRibRAUgmbG_DomRenderRootObject--></div><meta id="sBtNcYqLvFTruYUmYfKBvLIBzgTsgkCHYOEFmPip-end">
                        
    </div>
</div><meta id="YqlfbTjZGmrVUggwgONnPuqKrJEjZkeSraSxmeyh-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">format</code><span class="params">(date: Date, format: string): string</span>
                </span>
                <span class="desc content en">Format date to string</span>
                <span class="desc content ko">Format date to string</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">parse</code><span class="params">(dateString: string, format: string): Date</span>
                </span>
                <span class="desc content en">Parse string to date</span>
                <span class="desc content ko">Parse string to date</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">addDays</code><span class="params">(date: Date, days: number): Date</span>
                </span>
                <span class="desc content en">Add days to date</span>
                <span class="desc content ko">날짜에 일수 추가</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">addMonths</code><span class="params">(date: Date, months: number): Date</span>
                </span>
                <span class="desc content en">Add months to date</span>
                <span class="desc content ko">날짜에 월 추가</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">addYears</code><span class="params">(date: Date, years: number): Date</span>
                </span>
                <span class="desc content en">Add years to date</span>
                <span class="desc content ko">날짜에 연도 추가</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">diffInDays</code><span class="params">(date1: Date, date2: Date): number</span>
                </span>
                <span class="desc content en">Difference in days</span>
                <span class="desc content ko">일수 차이</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">diffInHours</code><span class="params">(date1: Date, date2: Date): number</span>
                </span>
                <span class="desc content en">Difference in hours</span>
                <span class="desc content ko">시간 차이</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isSameDay</code><span class="params">(date1: Date, date2: Date): boolean</span>
                </span>
                <span class="desc content en">Check if same day</span>
                <span class="desc content ko">같은 날 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isToday</code><span class="params">(date: Date): boolean</span>
                </span>
                <span class="desc content en">Check if today</span>
                <span class="desc content ko">오늘인지 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isFuture</code><span class="params">(date: Date): boolean</span>
                </span>
                <span class="desc content en">Check if future date</span>
                <span class="desc content ko">미래 날짜 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isPast</code><span class="params">(date: Date): boolean</span>
                </span>
                <span class="desc content en">Check if past date</span>
                <span class="desc content ko">과거 날짜 확인</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- URLUtils -->
                <div class="example-item">
                    <h3 id="url-utils">URLUtils</h3>
                    <p class="example-description content en">URL parsing, building, and manipulation utilities</p>
                    <p class="example-description content ko">URL 파싱, 빌딩 및 조작 유틸리티</p>
                    <div class="example-code">
                        <meta id="ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start"><style id="ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-snippet-container, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-header, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-copy-btn, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-copy-btn:active, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-copy-btn.copied, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-tabs, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).tab-btn, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).tab-btn:hover, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).tab-btn.active, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-content, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).code-tabs, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)).tab-btn, :is(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ *:not(#ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-start ~ #ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="gTNtaHdlcUVMXLkMnIhoyQZxngXGtehuSvZVYnot-start"><meta id="gTNtaHdlcUVMXLkMnIhoyQZxngXGtehuSvZVYnot-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start"><style id="aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)).language-type-indicator, :is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)).language-type-indicator:hover, :is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)).language-result-indicator, :is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)).language-result-indicator:hover, :is(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ *:not(#aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-start ~ #aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start"><style id="AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)) :host, #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ :host:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *) {
  display: block;
}
:is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)).code-snippet-pre, :is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)) code, #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ code:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)).language-indicator:hover, :is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)).code-snippet-pre, :is(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ *:not(#AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-start ~ #AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { URLUtils } from '@dooboostore/core/url/URLUtils';

// Parse query string
const params = URLUtils.parseQuery('?name=John&amp;amp;age=30');

// Build query string
const query = URLUtils.buildQuery({ name: 'John', age: 30 });

// Join URL parts
const url = URLUtils.join('https://api.com', 'users', '123');

// Get domain
const domain = URLUtils.getDomain('https://example.com/path');</p></code></pre><meta id="AdtCWaQOhRhwSILCdbXMAZRjXNKfOjbZILZauxcQ-end">
                            </div>
<meta id="iGxssrEgAioasNBUOejgvpnqhMrdImCKxLFkjqYh-start"><meta id="iGxssrEgAioasNBUOejgvpnqhMrdImCKxLFkjqYh-end">
<div style="display: none" class="language-type-indicator"><!--start text qNNIRyvodyxvgPtzgoVxZXJonWGTyScAEQuVVpXM_DomRenderRootObject-->text<!--end text qNNIRyvodyxvgPtzgoVxZXJonWGTyScAEQuVVpXM_DomRenderRootObject--></div><meta id="aNurCBmsbjSIsKlOEjvqUqaZEGCMbsebAXUbvwzj-end">
                        
    </div>
</div><meta id="ZSdDieeedrRIwxgVhawrFYUFblszAgIsPzyACBHx-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">parseQuery</code><span class="params">(queryString: string): Record&lt;string, string&gt;</span>
                </span>
                <span class="desc content en">Parse query string to object</span>
                <span class="desc content ko">Parse query string to object</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">buildQuery</code><span class="params">(params: Record&lt;string, any&gt;): string</span>
                </span>
                <span class="desc content en">Build query string from object</span>
                <span class="desc content ko">Build query string from object</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">join</code><span class="params">(...parts: string[]): string</span>
                </span>
                <span class="desc content en">Join URL parts</span>
                <span class="desc content ko">Join URL parts</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">getDomain</code><span class="params">(url: string): string</span>
                </span>
                <span class="desc content en">Extract domain from URL</span>
                <span class="desc content ko">Extract domain from URL</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">getPath</code><span class="params">(url: string): string</span>
                </span>
                <span class="desc content en">Extract path from URL</span>
                <span class="desc content ko">Extract path from URL</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isAbsolute</code><span class="params">(url: string): boolean</span>
                </span>
                <span class="desc content en">Check if absolute URL</span>
                <span class="desc content ko">절대 URL 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isRelative</code><span class="params">(url: string): boolean</span>
                </span>
                <span class="desc content en">Check if relative URL</span>
                <span class="desc content ko">상대 URL 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">addQueryParam</code><span class="params">(url: string, key: string, value: any): string</span>
                </span>
                <span class="desc content en">Add query parameter</span>
                <span class="desc content ko">쿼리 파라미터 추가</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">removeQueryParam</code><span class="params">(url: string, key: string): string</span>
                </span>
                <span class="desc content en">Remove query parameter</span>
                <span class="desc content ko">쿼리 파라미터 제거</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- ValidUtils -->
                <div class="example-item">
                    <h3 id="valid-utils">ValidUtils</h3>
                    <p class="example-description content en">Data validation and type checking utilities</p>
                    <p class="example-description content ko">데이터 검증 및 타입 체크 유틸리티</p>
                    <div class="example-code">
                        <meta id="yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start"><style id="yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-snippet-container, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-header, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-copy-btn, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-copy-btn:active, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-copy-btn.copied, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-tabs, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).tab-btn, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).tab-btn:hover, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).tab-btn.active, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-content, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).code-tabs, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)).tab-btn, :is(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ *:not(#yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-start ~ #yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="aXCLXBpycFSYZBGrfTbJpdDZvxcuabYsNPVDwEGj-start"><meta id="aXCLXBpycFSYZBGrfTbJpdDZvxcuabYsNPVDwEGj-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start"><style id="NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)).language-type-indicator, :is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)).language-type-indicator:hover, :is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)).language-result-indicator, :is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)).language-result-indicator:hover, :is(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ *:not(#NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-start ~ #NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start"><style id="HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)) :host, #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ :host:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *) {
  display: block;
}
:is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)).code-snippet-pre, :is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)) code, #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ code:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)).language-indicator:hover, :is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)).code-snippet-pre, :is(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ *:not(#HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-start ~ #HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';

// Email validation
const isEmail = ValidUtils.isEmail('test@example.com');

// URL validation
const isUrl = ValidUtils.isURL('https://example.com');

// Type checks
const isNum = ValidUtils.isNumber(42);
const isStr = ValidUtils.isString('hello');
const isEmpty = ValidUtils.isEmpty(null);</p></code></pre><meta id="HmKwgFJpGkcjhwEpCVtxESqvdppRPeohdCYpnQim-end">
                            </div>
<meta id="YGsJlDItkfJnLEQlDPssewoVBPXmUjGTgqJWCSNd-start"><meta id="YGsJlDItkfJnLEQlDPssewoVBPXmUjGTgqJWCSNd-end">
<div style="display: none" class="language-type-indicator"><!--start text lYUjmJwTRTGgDSdWdCWcDtAkvoZSdbJgwkqbzMgy_DomRenderRootObject-->text<!--end text lYUjmJwTRTGgDSdWdCWcDtAkvoZSdbJgwkqbzMgy_DomRenderRootObject--></div><meta id="NmaxlQbmnASrPzGHhvqRElFSQoaVDJORubaYCTGY-end">
                        
    </div>
</div><meta id="yHZZoCkjWuGUPoKAieyPmosWEpVJoYuLejkrNDSl-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">isEmail</code><span class="params">(value: string): boolean</span>
                </span>
                <span class="desc content en">Validate email address</span>
                <span class="desc content ko">이메일 주소 검증</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isURL</code><span class="params">(value: string): boolean</span>
                </span>
                <span class="desc content en">Validate URL</span>
                <span class="desc content ko">URL 검증</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isNumber</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if number</span>
                <span class="desc content ko">숫자 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isString</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if string</span>
                <span class="desc content ko">문자열 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isBoolean</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if boolean</span>
                <span class="desc content ko">불린 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isArray</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if array</span>
                <span class="desc content ko">배열 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isObject</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if object</span>
                <span class="desc content ko">객체 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isFunction</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if function</span>
                <span class="desc content ko">함수 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isEmpty</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if empty (null, undefined, '', [], {})</span>
                <span class="desc content ko">Check if empty (null, undefined, '', [], {})</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isNull</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if null</span>
                <span class="desc content ko">null 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isUndefined</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if undefined</span>
                <span class="desc content ko">undefined 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">isNullOrUndefined</code><span class="params">(value: any): boolean</span>
                </span>
                <span class="desc content en">Check if null or undefined</span>
                <span class="desc content ko">Check if null or undefined</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- RandomUtils -->
                <div class="example-item">
                    <h3 id="random-utils">RandomUtils</h3>
                    <p class="example-description content en">Random number and data generation utilities</p>
                    <p class="example-description content ko">난수 및 데이터 생성 유틸리티</p>
                    <div class="example-code">
                        <meta id="RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start"><style id="RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-snippet-container, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-header, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-copy-btn, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-copy-btn:active, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-copy-btn.copied, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-tabs, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).tab-btn, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).tab-btn:hover, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).tab-btn.active, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-content, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).code-tabs, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)).tab-btn, :is(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ *:not(#RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-start ~ #RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="oakyHnqLOgySVfJCocoEmqmlwvxjEWfCsCXOwGXQ-start"><meta id="oakyHnqLOgySVfJCocoEmqmlwvxjEWfCsCXOwGXQ-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start"><style id="nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)).language-type-indicator, :is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)).language-type-indicator:hover, :is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)).language-result-indicator, :is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)).language-result-indicator:hover, :is(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ *:not(#nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-start ~ #nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start"><style id="MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)) :host, #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ :host:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *) {
  display: block;
}
:is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)).code-snippet-pre, :is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)) code, #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ code:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)).language-indicator:hover, :is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)).code-snippet-pre, :is(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ *:not(#MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-start ~ #MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

// Random integer
const num = RandomUtils.int(1, 100);

// Random float
const float = RandomUtils.float(0, 1);

// Random string
const str = RandomUtils.string(10);

// Random UUID
const uuid = RandomUtils.uuid();

// Random element
const item = RandomUtils.pick([1, 2, 3, 4, 5]);</p></code></pre><meta id="MXhWsvufYDLmqxhibyIcLQMnfeuPaPCGOPtSiMTx-end">
                            </div>
<meta id="qJHoLZeGDupnqbKrcrNNTEoFsdcvhXHvuKQrrOXU-start"><meta id="qJHoLZeGDupnqbKrcrNNTEoFsdcvhXHvuKQrrOXU-end">
<div style="display: none" class="language-type-indicator"><!--start text TmvbAqAzAgJFXqnUqUBQgIolnfgXJZHkVYHFEGyj_DomRenderRootObject-->text<!--end text TmvbAqAzAgJFXqnUqUBQgIolnfgXJZHkVYHFEGyj_DomRenderRootObject--></div><meta id="nvUMmQJyecjrMgXAbDBNWFsoYoFarFAHkfuZtRgy-end">
                        
    </div>
</div><meta id="RScVKijetGUKDnTzqIhFVpGIUOoWIgfwowfwzgre-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">int</code><span class="params">(min: number, max: number): number</span>
                </span>
                <span class="desc content en">Random integer in range</span>
                <span class="desc content ko">범위 내 무작위 정수</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">float</code><span class="params">(min: number, max: number): number</span>
                </span>
                <span class="desc content en">Random float in range</span>
                <span class="desc content ko">Random float in range</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">string</code><span class="params">(length: number, charset?: string): string</span>
                </span>
                <span class="desc content en">Random string</span>
                <span class="desc content ko">무작위 문자열</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">uuid</code><span class="params">(): string</span>
                </span>
                <span class="desc content en">Generate UUID v4</span>
                <span class="desc content ko">Generate UUID v4</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">pick&lt;T&gt;</code><span class="params">(array: T[]): T</span>
                </span>
                <span class="desc content en">Pick random element from array</span>
                <span class="desc content ko">Pick random element from array</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">pickMultiple&lt;T&gt;</code><span class="params">(array: T[], count: number): T[]</span>
                </span>
                <span class="desc content en">Pick multiple random elements</span>
                <span class="desc content ko">Pick multiple random elements</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">boolean</code><span class="params">(): boolean</span>
                </span>
                <span class="desc content en">Random boolean</span>
                <span class="desc content ko">무작위 불린</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">hexColor</code><span class="params">(): string</span>
                </span>
                <span class="desc content en">Random hex color</span>
                <span class="desc content ko">무작위 16진수 색상</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">date</code><span class="params">(start: Date, end: Date): Date</span>
                </span>
                <span class="desc content en">Random date in range</span>
                <span class="desc content ko">Random date in range</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- ImageUtils -->
                <div class="example-item">
                    <h3 id="image-utils">ImageUtils</h3>
                    <p class="example-description content en">Image processing and manipulation utilities</p>
                    <p class="example-description content ko">이미지 처리 및 조작 유틸리티</p>
                    <div class="example-code">
                        <meta id="bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start"><style id="bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-snippet-container, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-header, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-copy-btn, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-copy-btn:active, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-copy-btn.copied, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-tabs, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).tab-btn, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).tab-btn:hover, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).tab-btn.active, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-content, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).code-tabs, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)).tab-btn, :is(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ *:not(#bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-start ~ #bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="JlwhpQDNNWEyBRAEPBplhhJKiVGiRTEgxsmiPEFF-start"><meta id="JlwhpQDNNWEyBRAEPBplhhJKiVGiRTEgxsmiPEFF-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start"><style id="uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)).language-type-indicator, :is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)).language-type-indicator:hover, :is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)).language-result-indicator, :is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)).language-result-indicator:hover, :is(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ *:not(#uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-start ~ #uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start"><style id="lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)) :host, #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ :host:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *) {
  display: block;
}
:is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)).code-snippet-pre, :is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)) code, #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ code:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)).language-indicator:hover, :is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)).code-snippet-pre, :is(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ *:not(#lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-start ~ #lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { ImageUtils } from '@dooboostore/core/image/ImageUtils';

// Load image
const img = await ImageUtils.load('image.jpg');

// Resize image
const resized = await ImageUtils.resize(img, 800, 600);

// Convert to base64
const base64 = await ImageUtils.toBase64(img);

// Crop image
const cropped = await ImageUtils.crop(img, 0, 0, 200, 200);</p></code></pre><meta id="lbXuIkBVKuGIbfKAbBzTQsRCwVhEyvztPaIuQbuW-end">
                            </div>
<meta id="kvIVzQZQSltsWlFbahmpUSHRhwybaCfwUUHIvKte-start"><meta id="kvIVzQZQSltsWlFbahmpUSHRhwybaCfwUUHIvKte-end">
<div style="display: none" class="language-type-indicator"><!--start text ZTeQhXGQBCbNaYYPctIzFJYIdSpNytPgvGwzpgxN_DomRenderRootObject-->text<!--end text ZTeQhXGQBCbNaYYPctIzFJYIdSpNytPgvGwzpgxN_DomRenderRootObject--></div><meta id="uoaYClOMfUFusfQtltcJRuajAEnclStOHZngVohs-end">
                        
    </div>
</div><meta id="bCqoZbWNDGDxdkQfCrEGSaSdTfwOTLFRgoOvYCBi-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">load</code><span class="params">(src: string): Promise&lt;HTMLImageElement&gt;</span>
                </span>
                <span class="desc content en">Load image from URL</span>
                <span class="desc content ko">URL에서 이미지 로드</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">resize</code><span class="params">(img: HTMLImageElement, width: number, height: number): Promise&lt;HTMLCanvasElement&gt;</span>
                </span>
                <span class="desc content en">Resize image</span>
                <span class="desc content ko">이미지 크기 조정</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">toBase64</code><span class="params">(img: HTMLImageElement | HTMLCanvasElement): string</span>
                </span>
                <span class="desc content en">Convert to base64</span>
                <span class="desc content ko">Convert to base64</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">crop</code><span class="params">(img: HTMLImageElement, x: number, y: number, width: number, height: number): Promise&lt;HTMLCanvasElement&gt;</span>
                </span>
                <span class="desc content en">Crop image</span>
                <span class="desc content ko">이미지 자르기</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">rotate</code><span class="params">(img: HTMLImageElement, degrees: number): Promise&lt;HTMLCanvasElement&gt;</span>
                </span>
                <span class="desc content en">Rotate image</span>
                <span class="desc content ko">이미지 회전</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">flip</code><span class="params">(img: HTMLImageElement, horizontal: boolean, vertical: boolean): Promise&lt;HTMLCanvasElement&gt;</span>
                </span>
                <span class="desc content en">Flip image</span>
                <span class="desc content ko">이미지 뒤집기</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- ReflectUtils -->
                <div class="example-item">
                    <h3 id="reflect-utils">ReflectUtils</h3>
                    <p class="example-description content en">Runtime reflection and metadata utilities for dynamic programming</p>
                    <p class="example-description content ko">동적 프로그래밍을 위한 런타임 리플렉션 및 메타데이터 유틸리티</p>
                    <div class="example-code">
                        <meta id="WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start"><style id="WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-snippet-container, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-header, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-copy-btn, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-copy-btn:active, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-copy-btn.copied, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-tabs, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).tab-btn, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).tab-btn:hover, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).tab-btn.active, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-content, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).code-tabs, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)).tab-btn, :is(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ *:not(#WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-start ~ #WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="rFWTjqxAlzmyRkATFSXefieCTavgyBFnhKHlQbcO-start"><meta id="rFWTjqxAlzmyRkATFSXefieCTavgyBFnhKHlQbcO-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start"><style id="eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)).language-type-indicator, :is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)).language-type-indicator:hover, :is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)).language-result-indicator, :is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)).language-result-indicator:hover, :is(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ *:not(#eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-start ~ #eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start"><style id="AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)) :host, #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ :host:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *) {
  display: block;
}
:is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)).code-snippet-pre, :is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)) code, #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ code:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)).language-indicator:hover, :is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)).code-snippet-pre, :is(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ *:not(#AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-start ~ #AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

// Get metadata
const metadata = ReflectUtils.getMetadata('design:type', target, key);

// Set metadata
ReflectUtils.defineMetadata('custom', value, target, key);

// Check metadata
const has = ReflectUtils.hasMetadata('design:type', target, key);

// Get property names
const props = ReflectUtils.getOwnPropertyNames(obj);</p></code></pre><meta id="AfiuYKLkkHycXevGLEdNCbMBkbIeNpeBRusiLMNt-end">
                            </div>
<meta id="KZrnucdhLqcQhxQBkHzIDuqymeBmbsreYLYNrTVa-start"><meta id="KZrnucdhLqcQhxQBkHzIDuqymeBmbsreYLYNrTVa-end">
<div style="display: none" class="language-type-indicator"><!--start text lTpckZtHzoiKtAHnyNVTvKgyuayVHusRTUmryAUz_DomRenderRootObject-->text<!--end text lTpckZtHzoiKtAHnyNVTvKgyuayVHusRTUmryAUz_DomRenderRootObject--></div><meta id="eSrJiLwHFDzhjTCEvSiugYYUoAlRsbTJOEihtRWl-end">
                        
    </div>
</div><meta id="WzihIOxskvvQpLUxGxrsJolhtfjgIKZnPqlyRJxx-end">
                    </div>
                    <details class="other-functions-details">
        <summary class="other-functions-summary">
            <span class="content en">OTHER FUNCTIONS</span>
            <span class="content ko">기타 함수</span>
        </summary>
        <ul class="other-functions-list">
            <li>
                <span class="func-signature">
                    <code class="func-name">getMetadata</code><span class="params">(key: any, target: any, propertyKey?: string | symbol): any</span>
                </span>
                <span class="desc content en">Get metadata</span>
                <span class="desc content ko">메타데이터 가져오기</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">defineMetadata</code><span class="params">(key: any, value: any, target: any, propertyKey?: string | symbol): void</span>
                </span>
                <span class="desc content en">Define metadata</span>
                <span class="desc content ko">메타데이터 정의</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">hasMetadata</code><span class="params">(key: any, target: any, propertyKey?: string | symbol): boolean</span>
                </span>
                <span class="desc content en">Check metadata existence</span>
                <span class="desc content ko">메타데이터 존재 확인</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">getOwnPropertyNames</code><span class="params">(obj: any): string[]</span>
                </span>
                <span class="desc content en">Get own property names</span>
                <span class="desc content ko">Get own property names</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">getOwnPropertyDescriptor</code><span class="params">(obj: any, prop: string): PropertyDescriptor | undefined</span>
                </span>
                <span class="desc content en">Get property descriptor</span>
                <span class="desc content ko">속성 설명자 가져오기</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">getPrototypeOf</code><span class="params">(obj: any): any</span>
                </span>
                <span class="desc content en">Get prototype</span>
                <span class="desc content ko">프로토타입 가져오기</span>
            </li>
            <li>
                <span class="func-signature">
                    <code class="func-name">setPrototypeOf</code><span class="params">(obj: any, proto: any): any</span>
                </span>
                <span class="desc content en">Set prototype</span>
                <span class="desc content ko">프로토타입 설정</span>
            </li>
        </ul>
    </details>
                </div>

                <!-- Expression -->
                <div class="example-item">
                    <h3 id="expression">Expression</h3>
                    <p class="example-description content en">Dynamic expression evaluation and parsing utilities with template binding</p>
                    <p class="example-description content ko">템플릿 바인딩을 사용한 동적 표현식 평가 및 파싱 유틸리티</p>
                    <div class="example-code">
                        <meta id="HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start"><style id="HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-style">@keyframes flash {
  from {
    background-color: #777;
  }
  to {
    background-color: #0d5126;
  }
}
/* Code Snippet Container - 기존 code-example 스타일 기반 */
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-snippet-container, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-snippet-container {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  /* margin-bottom: 1.5rem; */
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-header, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 0;
  border-bottom: 1px solid #3a3a3a;
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-copy-btn, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-copy-btn {
  background: #575757;
  color: #d8d8d8;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 0.3rem;
  flex-shrink: 0;
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-copy-btn:active, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-copy-btn:active {
  transform: scale(0.95);
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-copy-btn.copied, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-copy-btn.copied {
  background-color: #0d5126;
  animation: flash 0.4s ease-out;
}
/* 탭 스타일 - 헤더 안에 배치 */
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-tabs, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-tabs {
  display: flex;
  background: transparent;
  overflow-x: auto;
  flex: 1;
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).tab-btn, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .tab-btn {
  background: #2a2a2a;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-right: 1px solid #222;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: fit-content;
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).tab-btn:hover, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .tab-btn:hover {
  background: #3a3a3a;
  color: #e5e5e5;
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).tab-btn.active, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .tab-btn.active {
  background: #1a1a1a;
  color: #e5e5e5;
  border-bottom-color: #0366d6;
  font-weight: 500;
}
:is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-content, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-content {
  position: relative;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).code-tabs, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .code-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)).tab-btn, :is(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ *:not(#HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-start ~ #HPkGUZrgRqRQjsPlXScUFtguuAoIIkVTCRKrFpyj-end ~ *)) .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}</style><div class="code-snippet-container">
    <div class="code-header">
        <div class="code-tabs">
            <meta id="LkCGrIAzwgszlSLRjoCaOMbHbeXuVXwGLSumwyiO-start"><meta id="LkCGrIAzwgszlSLRjoCaOMbHbeXuVXwGLSumwyiO-end">
        </div>

        <button class="code-copy-btn"><i class="fa-solid fa-floppy-disk"></i></button>
    </div>
    <div class="code-content">
        
                            <meta id="UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start"><style id="UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
/* 언어 표시 floating 요소 */
:is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)).language-type-indicator, :is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)) .language-type-indicator {
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
  pointer-events: none;
}
:is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)).language-type-indicator:hover, :is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)) .language-type-indicator:hover {
  opacity: 1;
}
:is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)).language-result-indicator, :is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)) .language-result-indicator {
  position: absolute;
  bottom: 0rem;
  right: 0.1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #9ca3af;
  padding: 0rem 0.2rem;
  border-radius: 4px;
  font-size: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;
}
:is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)).language-result-indicator:hover, :is(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ *:not(#UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-start ~ #UDsXGMSERkLiIxLBCuNZtpYbXwquVfcYgQrfADZK-end ~ *)) .language-result-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px);</style><div style="display: none;" class="code-snippet">
                                <meta id="QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start"><style id="QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-style">/* Code Snippet - 기존 code-example 스타일과 일치 */
:is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)) :host, #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ :host:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *) {
  display: block;
}
:is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)).code-snippet-pre, :is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)) .code-snippet-pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  background: #1a1a1a;
  position: relative;
}
:is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)) code, #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ code:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *) {
  color: #e5e5e5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
:is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)).language-indicator:hover, :is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)) .language-indicator:hover {
  opacity: 1;
}
@media (max-width: 768px) {
  :is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)).code-snippet-pre, :is(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ *:not(#QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-start ~ #QHfPIpOdyqnJUCrXTTNaDJfwENxkLEuuPvTbwzQT-end ~ *)) .code-snippet-pre {
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
  }
}</style><pre class="code-snippet-pre"><code class="language-typescript"><p>import { Expression } from '@dooboostore/core/expression/Expression';

// Evaluate expression
const expr = new Expression('a + b * c');
const result = expr.evaluate({ a: 1, b: 2, c: 3 }); // 7

// Template binding
const template = new Expression('Hello, "></dr-this>-->
    </main>
</div><meta id="KxZIxGgmfofCPZznJUZKpeXIFkOVgkhotYvhwFIY-end"><meta id="NuduAmIMTbgsvSiBvUYZcfcjbXPbpJOoXlOSSPHn-end">
<!--    <dr-this value=""></dr-this>-->
</main>


<!--<iframe-->
<!--        src="https://stackblitz.com/edit/stackblitz-starters-1idcahki?embed=1&file=src/index.ts&hideNavigation=1&hidePreview=1&view=editor&env=MODE=vvvvvtest"-->
<!--        style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"-->
<!--&gt;-->
<!--</iframe>-->

<!-- Footer -->
<footer class="footer">
    <div class="footer-container">
        <div class="footer-simple">
            <div class="footer-links">
                <a href="https://github.com/dooboostore-develop" target="_blank" class="footer-link">
                    <i class="fab fa-github"></i>
                    GitHub
                </a>
                <a href="https://www.npmjs.com/~dooboostore" target="_blank" class="footer-link">
                    <i class="fab fa-npm"></i>
                    NPM
                </a>
                <a href="mailto:dooboostore@gmail.com" class="footer-link">
                    <i class="fas fa-envelope"></i>
                    Email
                </a>
            </div>

            <div class="footer-copyright">
<!--                <img src="assets/images/dooboostore.png" alt="dooboostore" class="footer-logo-small">-->
                <p>© 2025 dooboostore. All rights reserved.</p>
            </div>
        </div>
    </div>
</footer>
<meta id="ldzSuzztGcsdEVJubgDpzOVmrTwsakdVHTPkLErH-end"><meta id="dxiNIvFAiyxlYJequvANEUhheUXdyNBCgBpmdtXV-end"></div>
</body>
</html>
`
}