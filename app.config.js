module.exports = ({ config }) => {
  return {
    ...config, // This automatically contains everything from your app.json
    plugins: [...(config.plugins || []), "expo-localization"],
    extra: {
      ...config.extra,
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
  };
};
