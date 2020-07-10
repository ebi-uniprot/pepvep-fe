import React from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidv1 } from 'uuid';

import SignificancesColumn from './SignificancesColumn';
import SingleColocatedVariantDetails from './SingleColocatedVariantDetails';

const ColocatedVariantsBlock = ({ data }) => (
  <SignificancesColumn
    header="Colocated Variants"
  >
    {data.colocatedVariants
      .map(cv => (
        <SingleColocatedVariantDetails
          key={uuidv1()}
          colocated={cv}
          meta={data.variationDetails}
        />
      ))
    }
  </SignificancesColumn>
);

ColocatedVariantsBlock.propTypes = {
  data: PropTypes.shape({
    colocatedVariants: PropTypes.arrayOf(PropTypes.shape({})),
    variationDetails: PropTypes.shape({}),
  }),
};

ColocatedVariantsBlock.defaultProps = {
  data: {},
};

export default ColocatedVariantsBlock;
