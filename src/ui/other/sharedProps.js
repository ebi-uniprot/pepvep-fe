import PropTypes from 'prop-types';

export const detailsLinkPropTypes = PropTypes.element;
export const detailsLinkDefaultProps = null;

export const pubMedIDsPropTypes = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.number),
  PropTypes.arrayOf(PropTypes.string),
]);

export const pubMedIDsDefaultProps = [];

export const clinVarIDsPropTypes = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string,
  dbSNPId: PropTypes.string,
  pubMedIDs: pubMedIDsPropTypes,
  allele: PropTypes.string,
  date: PropTypes.string,
  gene: PropTypes.string,
  clinicalSignificances: PropTypes.string,
  mim: PropTypes.number,
  phenotype: PropTypes.string,
  url: PropTypes.string,
}));

export const clinVarIDsDefaultProps = [];

export const variationIDsPropTypes = PropTypes.shape({
  ids: PropTypes.shape({
    clinVarIDs: clinVarIDsPropTypes,
    cosmicId: PropTypes.string,
    dbSNPId: PropTypes.string,
    rsId: PropTypes.string,
  }),
});

export const variationIDsDefaultProps = {
  ids: {
    clinVarIDs: clinVarIDsDefaultProps,
    cosmicId: null,
    dbSNPId: null,
    rsId: null,
  },
};

export const variationDetailsPropTypes = PropTypes.shape({
  description: PropTypes.string,
  wildType: PropTypes.string,
  alternativeSequence: PropTypes.string,
  clinicalSignificances: PropTypes.string,
  sourceType: PropTypes.string,
  association: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    xrefs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
      url: PropTypes.string,
    })),
    evidences: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string,
      source: PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string,
        url: PropTypes.string,
        alternativeUrl: PropTypes.string,
      }),
    })),
    disease: PropTypes.bool,
  })),
  xrefs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
    url: PropTypes.string,
    alternativeUrl: PropTypes.string,
  })),
  polyphenScore: PropTypes.number,
  siftScore: PropTypes.number,
  disease: PropTypes.bool,
  nonDisease: PropTypes.bool,
  uniprot: PropTypes.bool,
  largeScaleStudy: PropTypes.bool,
  uncertain: PropTypes.bool,
});

export const variationDetailsDefaultProps = {};

export const variationPropTypes = PropTypes.shape({
  clinVarIDs: clinVarIDsPropTypes,
  cosmicId: PropTypes.string,
  dbSNPId: PropTypes.string,
  variationDetails: variationDetailsPropTypes,
  novel: PropTypes.bool,
  wildType: PropTypes.string,
  alternativeSequence: PropTypes.string,
  proteinColocatedVariants: PropTypes.arrayOf(PropTypes.shape({})),
  genomicColocatedVariants: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    pubMedIDs: pubMedIDsPropTypes,
  })),
  proteinColocatedVariantsCount: PropTypes.number,
  diseasAssociatedProteinColocatedVariantsCount: PropTypes.number,
});

export const variationDefaultProps = {};
