import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { v1 as uuidv1 } from 'uuid';

import SignificanceDataLine from './SignificanceDataLine';

const SingleColocatedVariantDetails = ({
  colocated,
  meta,
  excludeIds,
}) => {
  const {
    wildType,
    alternativeSequence,
    featureId,
    association,
    sourceType,
    xrefs,
    description,
  } = colocated;

  const {
    begin,
    end,
  } = meta;

  const variantIDs = {};

  if (xrefs) {
    xrefs.forEach((cr) => {
      if (!variantIDs[cr.name]) {
        variantIDs[cr.name] = {
          id: cr.id,
          url: cr.url,
        };
      }
    });
  }

  const idList = [];

  if (variantIDs.UniProt) {
    idList.push(variantIDs.UniProt);
  }

  if (variantIDs.ClinVar) {
    idList.push(variantIDs.ClinVar);
  }

  if (variantIDs.dbSNP) {
    idList.push(variantIDs.dbSNP);
  }

  let idListComponent = idList
    .map((id, index) => {
      let el;

      if (id.url) {
        el = (
          <a
            key={id.url}
            href={id.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {id.id}
          </a>
        );
      } else {
        el = <span key={id.id}>{id.id}</span>;
      }

      const comma = <Fragment key={uuidv1()}>, </Fragment>;

      return (index > 0)
        ? [comma, el]
        : el;
    });

  if (idList.length === 0 || excludeIds) {
    idListComponent = undefined;
  }

  const diseaseNames = association && association
    .map(a => a.name)
    .join(',');

  let source;

  if (featureId) {
    source = (sourceType === 'mixed' || sourceType === 'large_scale_study')
      ? 'UniProt, Large Scale Study'
      : 'UniProt';
  } else {
    source = 'Large Scale Study';
  }

  let aaChangeAndPositionValue = '-';

  if (wildType && alternativeSequence && begin && end) {
    aaChangeAndPositionValue = `${wildType}>${alternativeSequence}, ${begin}-${end}`;
  }

  return (
    <div className="significance-data-line-group">
      <SignificanceDataLine
        label="aa change and position"
        value={aaChangeAndPositionValue}
      />

      {idListComponent && (
        <SignificanceDataLine
          label="ID"
          value={idListComponent}
          alternativeLabelStyle
        />
      )}

      {description && (
        <SignificanceDataLine
          label="Description"
          value={description}
          alternativeLabelStyle
        />
      )}

      <SignificanceDataLine
        label="Disease"
        value={diseaseNames}
        alternativeLabelStyle
      />

      <SignificanceDataLine
        label="source"
        value={source}
        alternativeLabelStyle
      />
    </div>
  );
};

SingleColocatedVariantDetails.propTypes = {
  colocated: PropTypes.shape({
    wildType: PropTypes.string,
    alternativeSequence: PropTypes.string,
    featureId: PropTypes.string,
    association: PropTypes.arrayOf(PropTypes.shape({})),
    sourceType: PropTypes.string,
    xrefs: PropTypes.arrayOf(PropTypes.shape({})),
    description: PropTypes.string,
  }),
  meta: PropTypes.shape({
    begin: PropTypes.number,
    end: PropTypes.number,
  }),
  excludeIds: PropTypes.bool,
};

SingleColocatedVariantDetails.defaultProps = {
  colocated: {},
  meta: {},
  excludeIds: false,
};

export default SingleColocatedVariantDetails;
