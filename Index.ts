import RandomSettings from './RandomSettings';
import RandomCalc from './RandomCalc';
import RandomBrowser from './RandomBrowser';
import { displayBatteryPercentage, displayDateTime } from './systemInfo';

window.onload = () => {
  new RandomSettings();
  new RandomCalc();
  new RandomBrowser();
  displayBatteryPercentage();
  displayDateTime();
};
