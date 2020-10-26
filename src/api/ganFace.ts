import unirest from "unirest";

// var req = unirest("GET", "https://face-generator.p.rapidapi.com/faces/random");

// req.headers({
//   "x-rapidapi-host": "face-generator.p.rapidapi.com",
//   "x-rapidapi-key": "89ee52e4e9msh1d05f5557a7adbbp1e2aa1jsn81750205cd1b",
//   useQueryString: true,
// });

// req.end(function(res) {
//   if (res.error) throw new Error(res.error);

//   console.log(res.body);
// });

export const getGanFace = async () => {
  const response = await fetch(
    "https://face-generator.p.rapidapi.com/faces/random",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "face-generator.p.rapidapi.com",
        "x-rapidapi-key": process.env.GATSBY_RAPID_API_KEY,
        useQueryString: "true",
      },
    }
  );
  return response.blob();
};
