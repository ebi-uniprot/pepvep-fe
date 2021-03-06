import React from 'react';
import PropTypes from 'prop-types';

import ColocatedVariantsBlock from './ColocatedVariantsBlock';
import VariantIDsBlock from './VariantIDsBlock';
import PublicationsList from '../other/PublicationsList';

const ExpandedClinicalSignificance = (props) => {
  const { data, detailsLink } = props;

  return (
    <tr>
      <td colSpan="16">
        <span className="expanded-section-title">Clinical Significances</span>
        {detailsLink}

        <div className="significances-groups">
          <div className="column">
            <b>Disease association</b>

            <div className="associated-disease-list">
              {data.association.map((a, i) => {
                const links = a.evidences.map(({ source }) => {
                  if (source.name === 'pubmed') {
                    return (
                      <a
                        href={`${source.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={`${source.name}-${source.url}`}
                      >
                        {`${source.name}: ${source.id}`}
                      </a>
                    );
                  }

                  if (source.name === 'ClinVar') {
                    return (
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/clinvar?term=${source.id}`}
                        target="_target"
                        rel="noopener noreferrer"
                        key={`${source.name}-${source.id}`}
                      >
                        {`${source.name}: ${source.id}`}
                      </a>
                    );
                  }

                  return null;
                });

                let diseaseName = a.name;

                if (a.xrefs) {
                  a.xrefs.forEach((xr) => {
                    if (xr.name === 'MIM') {
                      diseaseName = (
                        <a
                          href={xr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {a.name}
                        </a>
                      );
                    }
                  });
                }

                const linksList = links.map(l => <li key={l.key}>{l}</li>);

                return (
                  <div className="associated-disease" key={`disease-wrapper-${i + 1}`}>
                    {`Disease #${i + 1}`}
                    :
                    {diseaseName}
                    <br />

                    <PublicationsList
                      title={`${links.length} Evidence(s)`}
                      items={<ul>{linksList}</ul>}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <ColocatedVariantsBlock data={data} />

          <VariantIDsBlock data={data.variationDetails.ids} />
        </div>
      </td>
    </tr>
  );
};

ExpandedClinicalSignificance.propTypes = {
  data: PropTypes.shape({
    association: PropTypes.arrayOf(PropTypes.shape({
      description: PropTypes.string,
      disease: PropTypes.bool,
      evidences: PropTypes.arrayOf(PropTypes.shape({
        code: PropTypes.string,
        source: PropTypes.shape({
          alternativeUrl: PropTypes.string,
          id: PropTypes.string,
          name: PropTypes.string,
          url: PropTypes.string,
        }),
        name: PropTypes.string,
        xrefs: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
          url: PropTypes.string,
        })),
      })),
    })),
    categories: PropTypes.arrayOf(PropTypes.string),
    colocatedVariantsCount: PropTypes.number,
    diseaseColocatedVariantsCount: PropTypes.number,
    variationDetails: PropTypes.shape({
      ids: PropTypes.shape({
        clinVarIDs: PropTypes.arrayOf(PropTypes.shape({})),
        cosmicId: PropTypes.string,
        dbSNPId: PropTypes.string,
        rsId: PropTypes.string,
      }),
    }),
  }),
  detailsLink: PropTypes.element.isRequired,
};

ExpandedClinicalSignificance.defaultProps = {
  data: {},
};

export default ExpandedClinicalSignificance;
