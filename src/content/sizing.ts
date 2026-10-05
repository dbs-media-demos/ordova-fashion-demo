/* Size charts (body measurements, inches). Converted to cm in the UI. */

export const alphaChart = {
  label: "Tops, dresses, knitwear & outerwear",
  cols: ["Size", "Bust / chest", "Waist", "Hip"],
  rows: [
    ["XS", [31, 33], [24, 26], [34, 36]],
    ["S", [33, 35], [26, 28], [36, 38]],
    ["M", [36, 38], [29, 31], [39, 41]],
    ["L", [39, 41], [32, 34], [42, 44]],
    ["XL", [42, 45], [35, 38], [45, 48]],
  ] as [string, [number, number], [number, number], [number, number]][],
};

export const waistChart = {
  label: "Trousers & denim (waist sizes)",
  cols: ["Size", "Waist", "Hip", "Inseam"],
  rows: [
    ["24", [24, 25], [34, 35], [27, 27]],
    ["26", [26, 27], [36, 37], [27, 27]],
    ["28", [28, 29], [37, 38], [32, 32]],
    ["30", [30, 31], [39, 40], [32, 32]],
    ["32", [32, 33], [41, 42], [32, 32]],
    ["34", [34, 35], [43, 44], [32, 32]],
    ["36", [36, 37], [45, 46], [32, 32]],
    ["38", [38, 39], [47, 48], [32, 32]],
  ] as [string, [number, number], [number, number], [number, number]][],
};

export const hatChart = {
  label: "Hats & belts",
  cols: ["Size", "Head circumference", "Belt fits waist", ""],
  rows: [
    ["S/M · S", [21.5, 22.5], [28, 30], [0, 0]],
    ["L/XL · M", [22.75, 23.75], [32, 34], [0, 0]],
    ["— · L", [0, 0], [36, 38], [0, 0]],
  ] as [string, [number, number], [number, number], [number, number]][],
};

export const howToMeasure = [
  { k: "Bust / chest", d: "Around the fullest part, under the arms, tape level across the back." },
  { k: "Waist", d: "Around your natural waist — the narrowest point, usually just above the navel." },
  { k: "Hip", d: "Around the fullest part of your hips, feet together." },
  { k: "Inseam", d: "From the crotch seam to the hem of a pair of trousers that fit you well." },
];
