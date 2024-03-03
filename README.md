
![jpp-domain-checker-screenshot](https://github.com/JPProfessionals/domain-checker/blob/main/.github/domain-tool-mockup.png)

# Domain-Checker Tool
This tool allows you to easily check domain name availability directly from your web application, leveraging the GoDaddy API for real-time data. Designed with simplicity and efficiency in mind, it integrates seamlessly into your projects.

[![Nuxt UI Pro](https://img.shields.io/badge/Made%20with-Nuxt%20UI%20Pro-00DC82?logo=nuxt.js&labelColor=020420)](https://ui.nuxt.com/pro)

[Live Demo](https://domain.jpprofessionals.de)

## Config
Ensure you have the dependencies installed:

```bash
pnpm install
```
Development Server
Launch the development server at http://localhost:3000:

``` bash
pnpm run dev
```
Production
Prepare the application for production:

``` bash
pnpm run build
```
Preview the production build locally:

``` bash
pnpm run preview
```

For deployment guidance, refer to the Nuxt deployment documentation.

## Using the Domain-Checker Tool
Configuration: Before starting, ensure you have configured the GoDaddy API keys in your .env file. Refer to our configuration guide for detailed steps.

Checking Domains: Use the tool's UI to input the domain name you wish to check. The tool will query the GoDaddy API and display whether the domain is available or not.
