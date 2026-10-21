import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
export default function IndexedContent(props: WrapperProps<typeof ContentType>) {
  return <div data-pagefind-body data-pagefind-filter="release:4.5"><Content {...props}/></div>;
}
