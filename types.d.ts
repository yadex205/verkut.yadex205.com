import React from 'react';

declare module 'temp/pages/*.js' {
  const Page: React.FC;
  export default Page;
}
