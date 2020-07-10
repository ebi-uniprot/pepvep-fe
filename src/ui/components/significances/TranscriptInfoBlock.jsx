import React from 'react';
import PropTypes from 'prop-types';

import SignificancesColumn from './SignificancesColumn';
import SignificanceDataLine from './SignificanceDataLine';
import { removeSnakeAndKebabCases } from '../../other/helpers';

const TranscriptInfoBlock = (props) => {
  const {
    data,
  } = props;

  const status = (data.canonical)
    ? 'SELECT'
    : 'Isoform';

  return (
    <SignificancesColumn
      header="Transcript Info"
    >
      <SignificanceDataLine
        label="Status"
        value={`${status} Transcript`}
      />

      <SignificanceDataLine
        label="Biotype"
        value={removeSnakeAndKebabCases(data.biotype)}
      />

      <SignificanceDataLine
        label="Codon"
        value={data.codons}
      />

      <SignificanceDataLine
        label="Consequence Terms"
        value={data.consequenceTerms && data.consequenceTerms.join(', ').replace(/_/g, ' ')}
      />

      <SignificanceDataLine
        label="ENST"
        value={data.enstId}
      />

      <SignificanceDataLine
        label="Other ENSTs"
        value={data.redundantENSTs && data.redundantENSTs}
      />
    </SignificancesColumn>
  );
};

TranscriptInfoBlock.propTypes = {
  data: PropTypes.shape({
    canonical: PropTypes.bool,
    enspId: PropTypes.string,
    enstId: PropTypes.string,
    ensgId: PropTypes.string,
    aminoAcids: PropTypes.string,
    codons: PropTypes.string,
    biotype: PropTypes.string,
    consequenceTerms: PropTypes.arrayOf(PropTypes.string),
    redundantENSTs: PropTypes.arrayOf(PropTypes.string),
  }),
};

TranscriptInfoBlock.defaultProps = {
  data: {},
};

export default TranscriptInfoBlock;
