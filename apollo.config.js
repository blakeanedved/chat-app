module.exports = {
  client: {
    includes: ["./frontend/**/*.ts", "./frontend/**/*.tsx"],
    service: {
      name: "chatapp-service",
      localSchemaFile: "./schema.graphql",
    },
  },
};
