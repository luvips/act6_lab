export interface RouteParams {
  page: number;
  search?: string;
}

export function parseRouteParams(params?: string[]): RouteParams {
  if (!params || params.length === 0) {
    return { page: 1 };
  }

  const result: RouteParams = { page: 1 };

  for (let i = 0; i < params.length; i++) {
    if (params[i] === 'page' && params[i + 1]) {
      result.page = parseInt(params[i + 1], 10) || 1;
      i++;
    } else if (params[i] === 'search' && params[i + 1]) {
      result.search = decodeURIComponent(params[i + 1]);
      i++;
    }
  }

  return result;
}

export function buildReportUrl(basePath: string, params: RouteParams): string {
  const segments: string[] = [];

  if (params.page > 1) {
    segments.push('page', params.page.toString());
  }

  if (params.search) {
    segments.push('search', encodeURIComponent(params.search));
  }

  return segments.length > 0 ? `${basePath}/${segments.join('/')}` : basePath;
}
