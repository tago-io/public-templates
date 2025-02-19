const fn = process.argv[2];
if (fn === "validate") {
  import("./functions/validate-templates");
} else if (fn === "generate") {
  import("./functions/generate-template-db");
} else {
  console.log('Invalid function');
}
