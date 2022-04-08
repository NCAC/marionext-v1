// Add Feature flags here
// e.g. 'class' => false
const FEATURES = {
  childViewEventPrefix: false,
  triggersStopPropagation: true,
  triggersPreventDefault: true,
  DEV_MODE: false
};

type features = "childViewEventPrefix" | "triggersStopPropagation" | "triggersPreventDefault" | "DEV_MODE";



type isEnabled = (name: features) => boolean;
const isEnabled: isEnabled = function (name) {
  return !!FEATURES[name];
}

type setEnabled = (name: features, state: boolean) => void;
const setEnabled: setEnabled = function setEnabled(name, state): boolean {
  return FEATURES[name] = state;
}

export {
  FEATURES,
  setEnabled,
  isEnabled
};
