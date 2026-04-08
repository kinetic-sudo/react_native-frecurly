<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Frecurly Expo app. The integration covers user identification via Clerk auth events, critical conversion and churn events, subscription engagement tracking, manual screen tracking with Expo Router, and error capture for auth and image upload failures.

## Files created or modified

| File | Change |
|---|---|
| `app.config.js` | Created — extends `app.json` with `posthogProjectToken` and `posthogHost` extras read from `.env` |
| `src/config/posthog.ts` | Created — PostHog client singleton with full configuration (batching, retries, feature flags) |
| `app/_layout.tsx` | Modified — added `PostHogProvider`, manual screen tracking via `usePathname` + `useEffect` |
| `app/(auth)/Sign-in.tsx` | Modified — `user_signed_in`, `sign_in_failed`, `posthog.identify`, `$exception` capture |
| `app/(auth)/Sign-up.tsx` | Modified — `user_signed_up`, `posthog.identify` on email verification complete |
| `app/(tabs)/settings.tsx` | Modified — `user_signed_out` + `posthog.reset()`, `profile_picture_updated`, `$exception` on upload error |
| `app/(tabs)/index.tsx` | Modified — `subscription_expanded`, `add_subscription_tapped` |
| `.env` | Updated — added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` |

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User successfully creates a new account and completes email verification | `app/(auth)/Sign-up.tsx` |
| `user_signed_in` | User successfully signs in with email and password (including MFA flow) | `app/(auth)/Sign-in.tsx` |
| `sign_in_failed` | Sign-in attempt failed due to invalid credentials or an error | `app/(auth)/Sign-in.tsx` |
| `user_signed_out` | User confirms and completes signing out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User taps a subscription card to expand its details on the home screen | `app/(tabs)/index.tsx` |
| `add_subscription_tapped` | User taps the add subscription button on the home screen | `app/(tabs)/index.tsx` |
| `profile_picture_updated` | User successfully uploads a new profile picture in settings | `app/(tabs)/settings.tsx` |

In addition, `posthog.screen()` is called on every route change in `app/_layout.tsx` for automatic screen tracking, and `$exception` events are sent on sign-in errors and image upload failures.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/154929/dashboard/608110
- **Sign-up to First Sign-in Funnel**: https://eu.posthog.com/project/154929/insights/uerCkiH8
- **New User Sign-ups (Daily)**: https://eu.posthog.com/project/154929/insights/GJd3yksY
- **Active Users vs Churn (Sign-ins vs Sign-outs)**: https://eu.posthog.com/project/154929/insights/vzzv5Otp
- **Sign-in Failures**: https://eu.posthog.com/project/154929/insights/vk1697bq
- **Subscription Engagement**: https://eu.posthog.com/project/154929/insights/XBRG0xAT

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
