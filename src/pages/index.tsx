import React from 'react';
import { Link } from 'react-router-dom';

import { Meta } from '~components/meta';

const Page: React.FC = () => {
  return (
    <div>
      <Meta title="Yadex205" description="HTML Shoppe. Amateur VJ." canonicalPath="/" />
      <Link to="/about/">about</Link>
      index.html
    </div>
  );
};

export default Page;
