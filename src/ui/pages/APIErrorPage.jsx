
import React, { Fragment } from 'react';

import DefaultPageLayout from '../layout/DefaultPageLayout';

const APIErrorContent = () => (
  <Fragment>
    <h3>Something went wrong...</h3>
    <p>
      Unfortunately we weren&apos;t able to complete your request. We use various services
      in the background to fulfil each request and sometimes failure of one of these
      services can result in the complete failure of the service.
    </p>
    <p>
      Please try again in a few minutes and get in touch with us if the issue persists.
    </p>
  </Fragment>
);

const APIErrorPage = () => (
  <DefaultPageLayout
    content={<APIErrorContent />}
  />
);

export default APIErrorPage;
