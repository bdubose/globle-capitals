declare global {
  type Continent =
    | "Asia"
    | "Europe"
    | "Africa"
    | "North America"
    | "South America"
    | "Oceania"
    | "None";

  type City = {
    id: number;
    city: string;
    city_ascii: string;
    lat: number;
    lng: number;
    country: string;
    iso2: string;
    iso3: string;
    admin_name: string;
    capital: string;
    population: number;
    is_territory: boolean;
    continent: Continent;
    guessable: boolean;
    rank: number;
  };

  type Guess = {
    city: City;
    order: number;
  };
}

export {};
