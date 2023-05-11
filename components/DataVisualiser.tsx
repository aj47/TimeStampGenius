import { useQuery, gql } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

const COUNTRY_QUERY = gql`
  {
    country(code: "AU") {
      name
      native
      capital
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
`;

const DataVisualiser = () => {
  const { data, loading, error } = useQuery(COUNTRY_QUERY);
  console.log(data, "data");
  if (loading) return <Text>Loading...</Text>;
  if (error) return <pre>{error.message}</pre>;
  const country = data.country;
  return (
    <Box mb={10}>
      <h2>Data about {country.name}:</h2>
      <h3>Capital: {country.capital}</h3>
      <h3>Currency: {country.currency}</h3>
    </Box>
  );
};

export default DataVisualiser;
