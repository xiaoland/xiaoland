import type {
  ActionFunctionArgs as RRActionFunctionArgs,
  LoaderFunctionArgs as RRLoaderFunctionArgs,
  MetaFunction as RRMetaFunction,
} from 'react-router';

declare global {
  namespace Route {
    type LoaderArgs = RRLoaderFunctionArgs;
    type ActionArgs = RRActionFunctionArgs;
    type MetaArgs = {
      data?: any;
      params?: any;
      location?: any;
    };
    type ComponentProps = {
      loaderData?: any;
      actionData?: any;
      [key: string]: any;
    };
    type ErrorBoundaryProps = {
      error: any;
    };
    type LinksFunction = () => { rel: string; href: string; crossOrigin?: string }[];
  }
}
