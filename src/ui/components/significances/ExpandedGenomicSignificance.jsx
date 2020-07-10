import React from 'react';
import PropTypes from 'prop-types';

import PopulationFrequencyBlock from './PopulationFrequencyBlock';
import ConsequencePredictionBlock from './ConsequencePredictionBlock';
import VariantDetailsBlock from './VariantDetailsBlock';
import {
  detailsLinkPropTypes,
  detailsLinkDefaultProps,
  variationIDsPropTypes,
  variationPropTypes,
  variationDefaultProps,
} from '../../other/sharedProps';

const ExpandedGenomicSignificance = (props) => {
  const {
    data,
    variation,
    detailsLink,
    gene,
  } = props;

  return (
    <tr>
      <td colSpan="16">
        <span className="expanded-section-title">Genome Level Impact</span>
        {detailsLink}

        <div
          className="significances-groups"
          key="genomic-significances-group-wrapper"
        >
          <PopulationFrequencyBlock data={data.populationFrequencies} />

          <ConsequencePredictionBlock data={data.consequencePrediction} />

          <VariantDetailsBlock
            data={data}
            variation={variation}
            gene={gene}
          />
        </div>
      </td>
    </tr>
  );
};

ExpandedGenomicSignificance.propTypes = {
  detailsLink: detailsLinkPropTypes,
  data: PropTypes.shape({
    populationFrequencies: PropTypes.shape({}),
    consequencePrediction: PropTypes.shape({}),
    variationDetails: variationIDsPropTypes,
  }),
  variation: variationPropTypes,
  gene: PropTypes.shape({
    ensgId: PropTypes.string,
  }),
};

ExpandedGenomicSignificance.defaultProps = {
  data: {},
  variation: variationDefaultProps,
  detailsLink: detailsLinkDefaultProps,
  gene: {},
};

export default ExpandedGenomicSignificance;
