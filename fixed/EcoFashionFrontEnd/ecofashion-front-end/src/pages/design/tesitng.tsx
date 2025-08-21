import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Typography,
} from "@mui/material";

export default function CountryCitySelect() {
  const [countries, setCountries] = useState<
    { name: string; lat: number; long: number }[]
  >([]);
  const [country, setCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  const VN_COORD = { lat: 14.0583, long: 108.2772 }; // Trung tâm VN

  useEffect(() => {
    (async () => {
      setLoadingCountries(true);
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/positions"
      );
      const data = await res.json();
      setCountries(
        data.data
          .map((c: any) => ({
            name: c.name,
            lat: c.lat,
            long: c.long,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
      );
      setLoadingCountries(false);
    })();
  }, []);

  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const handleCountryChange = async (val: string) => {
    setCountry(val);
    setCity("");
    setDistance(null);

    const selected = countries.find((c) => c.name === val);
    if (selected) {
      const dist = haversineDistance(
        selected.lat,
        selected.long,
        VN_COORD.lat,
        VN_COORD.long
      );
      setDistance(Math.round(dist));
    }

    setLoadingCities(true);
    const res = await fetch(
      "https://countriesnow.space/api/v0.1/countries/cities",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: val }),
      }
    );
    const data = await res.json();
    setCities((data.data || []).sort());
    setLoadingCities(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Quốc gia</InputLabel>
          <Select
            label="Quốc gia"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            disabled={loadingCountries}
          >
            {loadingCountries && (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            )}
            {countries.map((c) => (
              <MenuItem key={c.name} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          size="small"
          disabled={!country || loadingCities}
        >
          <InputLabel>Thành phố</InputLabel>
          <Select
            label="Thành phố"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {loadingCities && (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            )}
            {cities.map((ct) => (
              <MenuItem key={ct} value={ct}>
                {ct}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {distance !== null && (
        <Typography variant="body1">
          📏 Khoảng cách tới Việt Nam: <strong>{distance} km</strong>
        </Typography>
      )}
    </Box>
  );
}
