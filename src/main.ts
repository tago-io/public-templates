const fn = process.argv[2];
if (fn === "validator") {
  import("./functions/tagoio-validator");
} else if (fn === "generate") {
  import("./functions/generate-template-db");
} else {
  console.log('Invalid function');
}
