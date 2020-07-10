
import React from 'react';
import PropTypes from 'prop-types';

import ColocatedDomainsAndSitesBlock from './ColocatedDomainsAndSitesBlock';
import ColocatedVariantsBlock from './ColocatedVariantsBlock';
import VariantDetailsBlock from './VariantDetailsBlock';
import ColocatedPTMsBlock from './ColocatedPTMsBlock';
import ColocatedMoleculeProcessing from './ColocatedMoleculeProcessing';
import {
  detailsLinkPropTypes,
  detailsLinkDefaultProps,
  variationPropTypes,
  variationDefaultProps,
} from '../../other/sharedProps';

const ExpandedFunctionalSignificance = ({
  data,
  variation,
  detailsLink,
}) => (
  <tr>
    <td colSpan="16">
      <span className="expanded-section-title">Functional Protein Level Impact</span>
      {detailsLink}

      <div className="significances-groups">

        <ColocatedDomainsAndSitesBlock data={data.features} />

        <div className="significances-stacked-columns">
          <VariantDetailsBlock
            data={data}
            variation={variation}
          />
          <ColocatedVariantsBlock data={data} />
        </div>

        <ColocatedPTMsBlock data={data.features} />

        <ColocatedMoleculeProcessing data={data.features} />

      </div>
    </td>
  </tr>
);

ExpandedFunctionalSignificance.propTypes = {
  data: PropTypes.shape({
    features: PropTypes.arrayOf(PropTypes.shape({
      begin: PropTypes.string,
      category: PropTypes.string,
      description: PropTypes.string,
      end: PropTypes.string,
      evidences: PropTypes.arrayOf(PropTypes.shape({})),
      type: PropTypes.string,
      typeDescription: PropTypes.string,
    })),
  }),
  detailsLink: detailsLinkPropTypes,
  variation: variationPropTypes,
};

ExpandedFunctionalSignificance.defaultProps = {
  data: {},
  detailsLink: detailsLinkDefaultProps,
  variation: variationDefaultProps,
};

export default ExpandedFunctionalSignificance;
