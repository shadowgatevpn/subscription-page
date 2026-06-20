export type RuntimePageConfig = {
  supportUrl: string;
};

type RuntimeEnv = {
  SUPPORT_URL?: string;
  VITE_SUPPORT_URL?: string;
};

export function getRuntimeSupportUrl(env: RuntimeEnv): string {
  return env.SUPPORT_URL?.trim() || env.VITE_SUPPORT_URL?.trim() || "";
}

export function getRuntimePageConfig(env: RuntimeEnv): RuntimePageConfig {
  return {
    supportUrl: getRuntimeSupportUrl(env),
  };
}
