# TagoIO - Dashboard Templates

This repository contains the necessary tools and guidelines for creating and managing dashboard templates for the TagoIO platform. Dashboard templates allow users to quickly set up pre-configured dashboards for specific use cases.

## Table of Contents

- [Folder Structure](#folder-structure)
- [Manifests](#manifests)
- [Adding a New Dashboard Template](#adding-a-new-dashboard-template)
- [Submitting a Template Pull Request](#submitting-a-template-pull-request)

## Folder Structure

The project follows this folder structure:

- [`./templates/`](./templates/): This directory contains the dashboard templates.
  - `./dashboard/template-name/`: This directory should be named with the dashboard template name.
- [`./src/`](./src/): This directory contains the validation and generation scripts.
  - [`./src/schema/`](./src/schema/): This directory contains the JSON schemas for the templates.

## Manifests

Manifests are JSONC files that describe the details of each template. They are essential for ensuring that the template is correctly identified and processed by the TagoIO platform.

### Dashboard Templates

- **Images**
  - **Logo**: Expected dimension `443x160`
- **Manifest File:** `manifest.jsonc`
- **Template Config File:** `standard/template-config.jsonc`
- **Structure File:** `standard/structure.json`

### Example: Dashboard Manifest

Here's an example of a `manifest.jsonc` file for a dashboard template:

```jsonc
{
  "$schema": "../../../src/schema/dashboard-template.json",
  "name": "Chicago Bus",
  "images": {
    "logo": "./assets/logo.png"
  },
  "structure": {
    "standard": "./standard/structure.json"
  },
  "manifest": {
    "standard": "./standard/template-config.jsonc"
  },
  "description": "./description.md"
}
```

### Example: Template Config

Here's an example of a `template-config.jsonc` file for a dashboard template:

```jsonc
{
  "$schema": "../../../../src/schema/dashboard-template-config.json",
  "use_mock": true,
  "type": "standard",
  "setup": {
    "devices": [{
      "id": "60888a20ea380c001298a45d",
      "name": "Chicago Bus",
      "description": "Chicago Bus Device"
    }]
  }
}
```

## Adding a New Dashboard Template

1. **Create a new folder:**

   - Navigate to [`./templates/dashboard/`](./templates/dashboard/) and create a new folder named after your dashboard template.

2. **Create the manifest file:**

   - Inside this folder, create a `manifest.jsonc` file. Follow the structure defined in [`dashboard-template.json`](./src/schema/dashboard-template.json).

3. **Create a standard folder:**

   - Inside your template folder, create a `standard` folder.

4. **Create template files:**
   - Inside the standard folder, create a `structure.json` file containing the dashboard structure.
   - Create a `template-config.jsonc` file following the structure defined in [`dashboard-template-config.json`](./src/schema/dashboard-template-config.json).

5. **Add a description:**
   - Create a `description.md` file in your template folder with a detailed description of the template.

6. **Add assets:**
   - Create an `assets` folder in your template folder.
   - Add a `logo.png` file to the assets folder.

## Submitting a Template Pull Request

1. **Create a new branch:**

   - Create a new branch for your template.

2. **Add your template:**

   - Follow the instructions above to add your template.

3. **Run these commands to validate your changes:**

   - **Validate your template files:**

   ```bash
   npm start validate
   ```

   - **Generate template database:**

   ```bash
   npm start generate
   ```

   - Make sure all commands execute successfully without errors before submitting your PR. This helps maintain code quality and ensures all documentation is up to date.

4. **Commit your changes:**

   - Commit your changes and open a pull request for review.

5. **Review and feedback:**

   - Wait for the Pull Request to be reviewed. You may need to make some changes based on the feedback you receive.

---

For more detailed information, please refer to the examples provided in the repository and the schema files located in the `./src/schema/` directory.
