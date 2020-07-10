import React from 'react';
import PropTypes from 'prop-types';

import TranscriptInfoBlock from './TranscriptInfoBlock';
import TranslationInfoBlock from './TranslationInfoBlock';
import VariantDetailsBlock from './VariantDetailsBlock';
import {
  detailsLinkPropTypes,
  detailsLinkDefaultProps,
  variationPropTypes,
  variationDefaultProps,
} from '../../other/sharedProps';

const ExpandedTranscriptSignificance = (props) => {
  const {
    data,
    variation,
    detailsLink,
  } = props;

  return (
    <tr>
      <td colSpan="16">
        <span className="expanded-section-title">Transcript Impact</span>
        {detailsLink}

        { data.map(ts => (
          <div
            className="significances-groups"
            key={`transcript-significances-group-wrapper-${ts.hgvsp}`}
          >
            <TranscriptInfoBlock data={ts} />

            <TranslationInfoBlock data={ts} />

            <VariantDetailsBlock
              data={ts}
              variation={variation}
            />
          </div>
        ))}
      </td>
    </tr>
  );
};

ExpandedTranscriptSignificance.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    aminoAcids: PropTypes.string,
    appris: PropTypes.string,
    biotype: PropTypes.string,
    blosum62: PropTypes.number,
    caddPhred: PropTypes.number,
    caddRaw: PropTypes.number,
    canonical: PropTypes.bool,
    codons: PropTypes.string,
    consequenceTerms: PropTypes.arrayOf(PropTypes.string),
    end: PropTypes.number,
    fathmmPrediction: PropTypes.string,
    fathmmScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hgvsg: PropTypes.string,
    hgvsp: PropTypes.string,
    impact: PropTypes.string,
    lrtPrediction: PropTypes.string,
    lrtScore: PropTypes.number,
    mostSevereConsequence: PropTypes.string,
    mutPredScore: PropTypes.number,
    mutationTasterPrediction: PropTypes.string,
    mutationTasterScore: PropTypes.string,
    polyphenPrediction: PropTypes.string,
    polyphenScore: PropTypes.number,
    proveanPrediction: PropTypes.string,
    proveanScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    siftPrediction: PropTypes.string,
    siftScore: PropTypes.number,
    start: PropTypes.number,
    tsl: PropTypes.number,
    colocatedVariantsCount: PropTypes.number,
    diseaseColocatedVariantsCount: PropTypes.number,
    enspId: PropTypes.string,
    ensgId: PropTypes.string,
    enstId: PropTypes.string,
  })),
  variation: variationPropTypes,
  detailsLink: detailsLinkPropTypes,
};

ExpandedTranscriptSignificance.defaultProps = {
  data: {},
  variation: variationDefaultProps,
  detailsLink: detailsLinkDefaultProps,
};

export default ExpandedTranscriptSignificance;
