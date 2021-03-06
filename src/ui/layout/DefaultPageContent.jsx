
import React from 'react';
import PropTypes from 'prop-types';

const DefaultPageContent = (props) => {
  const { children } = props;

  return (
    <div className="default-page-conent">
      {children}
    </div>
  );
};

DefaultPageContent.propTypes = {
  children: PropTypes.node,
};

DefaultPageContent.defaultProps = {
  children: 'Default Page Content',
};

export default DefaultPageContent;
