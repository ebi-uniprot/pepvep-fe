import React from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidv1 } from 'uuid';

import SignificancesColumn from './SignificancesColumn';
import SignificanceDataLine from './SignificanceDataLine';

const PopulationFrequencyBlock = (props) => {
  const {
    data,
  } = props;

  let gnomAD = null;
  let oneK = null;

  if (data) {
    gnomAD = data.gnomAD && Object.keys(data.gnomAD)
      .reduce((all, key) => {
        if (data.gnomAD[key].value) {
          all.push(
            <li key={uuidv1()}>
              <span className="frequency-label">
                {data.gnomAD[key].label}
                :
              </span>
              {data.gnomAD[key].value}
            </li>,
          );
        }

        return all;
      }, []);

    oneK = data['1kg'] && Object.keys(data['1kg'])
      .reduce((all, key) => {
        if (data['1kg'][key].value) {
          all.push(
            <li key={uuidv1()}>
              <span className="frequency-label">
                {data['1kg'][key].label}
                :
              </span>
              {data['1kg'][key].value}
            </li>,
          );
        }

        return all;
      }, []);
  }

  return (
    <SignificancesColumn
      header="Population Frequency"
    >
      <SignificanceDataLine
        label="gnomAD"
        value={(gnomAD) ? <ul>{gnomAD}</ul> : <span>Not reported</span>}
      />

      <SignificanceDataLine
        label="1000 Genomes"
        value={(oneK && oneK.length > 0) ? <ul>{oneK}</ul> : <span>Not reported</span>}
      />
    </SignificancesColumn>
  );
};

PopulationFrequencyBlock.propTypes = {
  data: PropTypes.shape({
    gnomAD: PropTypes.shape({}),
    '1kg': PropTypes.shape({}),
  }),
};

PopulationFrequencyBlock.defaultProps = {
  data: {},
};

export default PopulationFrequencyBlock;
