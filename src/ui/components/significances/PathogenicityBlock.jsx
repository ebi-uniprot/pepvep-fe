import React from 'react';
import PropTypes from 'prop-types';

import SignificancesColumn from './SignificancesColumn';
import SignificanceDataLine from './SignificanceDataLine';

const PathogenicityBlock = (props) => {
  const {
    data,
  } = props;

  const all = (data.pathogenicity)
    ? data.pathogenicity.join(', ')
    : '-';

  return (
    <SignificancesColumn
      header="Pathogenicity"
    >
      <SignificanceDataLine
        label="All"
        value={all}
      />

      <SignificanceDataLine
        label="COSMIC"
        value={(data.cosmicId) ? data.cosmicId : 'Not reported'}
      />
    </SignificancesColumn>
  );
};

PathogenicityBlock.propTypes = {
  data: PropTypes.shape({
    pathogenicity: PropTypes.arrayOf(PropTypes.string),
    cosmicId: PropTypes.string,
  }),
};

PathogenicityBlock.defaultProps = {
  data: {},
};

export default PathogenicityBlock;
