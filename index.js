/**
 * index.js
 * 
 * Copyright (c) 2013, Adam Stark <llamadonica@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *  
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

function adjustElementToSpread (elementToAdjust, elementToSpread, adjustedWidth) {
  var adjustedWidth = adjustedWidth - elementToSpread.getBoundingClientRect().right + elementToAdjust.getBoundingClientRect().width;
  elementToAdjust.setAttribute('style','width:' + adjustedWidth + 'px;');
}

function loadSynchronizedElementsWithDefaults (listOfElementsAndDefaults) {
  // Takes an associative array with elements
  var keys = [];
  this.data = listOfElementsAndDefaults;
  for (var i in listOfElementsAndDefaults) keys.push(i);
  chrome.storage.sync.get(keys,function (presetValues) {
    for (var i=0; i < options.calculate.length; i ++) {
      options.calculate[i].addEventListener('click',function (event) {
        setOptionToCascadeCalculation ('calculate', window.data.calculate = event.target.value);
      });
    }
    options.calculateButton.addEventListener('click', function (event) {
      calculateBlank ();
      event.preventDefault ();
      return false;
    });
    options.tableButton.addEventListener('click', function (event) {
      createAmortizationSchedule () ;
      event.preventDefault ();
      return false;
    });
    
    for (var i in listOfElementsAndDefaults) {
      if (presetValues[i] === undefined) {
        setOptionToValidatedValue(i,listOfElementsAndDefaults[i]);
      } else {
        setOptionToValidatedValue(i,window.data[i] = presetValues[i]);
      }
      if (i != 'calculate') options[i].addEventListener('change', function (event) {
        getOptionToValidatedValue(event.target.name);
      });
    }
  });
}

function calculateBlank () {
      if (window.data.calculate == 'initialValue') {
        calculateInitialValue ();
      } else if (window.data.calculate == 'interest') {
        calculateInterestRate ();
      } else if (window.data.calculate == 'termLength') {
        calculateNumberOfPayments ();
      } else if (window.data.calculate == 'paymentValue') {
        calculatePaymentValue ();
      } else if (window.data.calculate == 'futureValue') {
        calculateFutureValue ();
      }
}

function setOptionToValidatedValue (key, value) {
  if (key == 'initialValue' ||
      key == 'paymentValue' ||
      key == 'futureValue') {
    return setOptionToValidatedDollarAmount (key,value);
  }
  if (key == 'interest') {
    return setOptionToValidatedPercentage (key,value);
  }
  if (key == 'termLength' || 
      key == 'periodicity') {
    return setOptionToValidatedInteger (key,value);
    if (key == 'periodicity') window.data.periodicity = value;
  }
  if (key == 'periodicityPeriod') {
    return setOptionToCascadePeriodicity (key, value);
    if (value == 'months') window.data.periodicity = 12;
  }
  if (key == 'calculate') {
    return setOptionToCascadeCalculation (key, value);
  }
  options[key].value = value;
}

function valueToDollarAmount (value) {
  var isNegative = value < 0;
  value = Math.abs(value);
  var lengthOfFixed = value.toFixed().length; 
  var sourceString = value.toFixed(2);
  var lengthOfFixed = sourceString.replace(/\..*$/,'').length; 
  lengthOfFixed = (lengthOfFixed%3 == 0)?3:lengthOfFixed%3;
  var destString = isNegative?'$ (':'$ ';
  for (var i = 0; sourceString[i] != '.'; i += lengthOfFixed) {
    if (i > 0) {
      destString += ',';
      lengthOfFixed = 3;
    }
    destString += sourceString.substring(i, i+lengthOfFixed);
  }
  destString += sourceString.substring(i);
  destString += isNegative?')':'';
  return destString;
}
function setOptionToValidatedDollarAmount (key, value) {
  options[key].value = valueToDollarAmount (value);
}

function setOptionToValidatedPercentage (key,value) {
  options[key].value = value.toFixed(3) + '%';
}

function setOptionToValidatedInteger (key,value) {
  options[key].value = value.toFixed();
}

function setOptionToCascadePeriodicity (key,value) {
  if (value=='months') {
    options.periodicity.disabled = true;
    options.periodicity.value = '';
  } else {
    options.periodicity.disabled = false;
    if (options.periodicity.value == '') options.periodicity.value = 12;
  }
  options[key].value = value;
}

function setOptionToCascadeCalculation (key, value) {
  for (var i =0; i < options.calculate.length; i++) {
    if (options.calculate[i].value != value) {
      options[options.calculate[i].value].disabled = false;
      options.calculate[i].checked = false;
    } else {
      options[options.calculate[i].value].disabled = true;
      options.calculate[i].checked = true;
    }
  }
}

function getOptionToValidatedValue (key) {
  if (key == 'initialValue' ||
      key == 'paymentValue' ||
      key == 'futureValue') {
    return getOptionToValidatedDollarAmount (key);
  }
  if (key == 'interest') {
    return getOptionToValidatedPercentage (key);
  }
  if (key == 'termLength' || 
      key == 'periodicity') {
    return getOptionToValidatedInteger (key);
  }
  if (key == 'interestPeriod') {
    if (window.data.interestPeriod != options[key].value) {
      if (options[key].value == 'year') { //Was per period, now is per year
        setOptionToValidatedValue('interest',window.data.interest = window.data.interest*window.data.periodicity);
      } else {                            //Was per year, now is per period
        setOptionToValidatedValue('interest',window.data.interest = window.data.interest/window.data.periodicity);
      }
    }
  }
  if (key == 'termPeriod') {
    if (window.data.termPeriod != options[key].value) {
      if (options[key].value == 'year') { //Was per period, now is per year
        setOptionToValidatedValue('termLength',window.data.termLength = window.data.termLength/window.data.periodicity);
      } else {                            //Was per year, now is per period
        setOptionToValidatedValue('termLength',window.data.termLength = window.data.termLength*window.data.periodicity);
      }
    }
  }
  setOptionToValidatedValue(key,window.data[key] = options[key].value);
}

function getOptionToValidatedDollarAmount (key) {
  var valueFloat = parseFloat(options[key].value.replace(/^\s*\$\s*/,'').replace(/^\((.*)\)$/,'-$1').replace(/^(-?)\s*\$\s*/,'$1').replace(/,/g,''));
  if (!isNaN(valueFloat)) {
    window.data[key] = valueFloat;
  }
  setOptionToValidatedValue(key,window.data[key]);
}

function getOptionToValidatedPercentage (key) {
  var valueFloat = parseFloat(options[key].value.replace(/\s*%$/,''));
  if (!isNaN(valueFloat)) {
    window.data[key] = valueFloat;
  }
  setOptionToValidatedValue(key,window.data[key]);
}

function getOptionToValidatedInteger (key) {
  var valueInt = parseInt(options[key].value,10);
  if (!isNaN(valueInt)) {
    window.data[key] = valueInt;
  }
  setOptionToValidatedValue(key,window.data[key]);
}

function futureValueFormula (periodicRate) {
  var nPeriods     = (window.data.termPeriod == 'year')?(window.data.termLength*window.data.periodicity):window.data.termLength;
  return window.data.initialValue*Math.pow(periodicRate,nPeriods) - window.data.paymentValue*(Math.pow(periodicRate,nPeriods) - 1)/(periodicRate - 1);
}

function calculateFutureValue () {
  var periodicRate = (window.data.interestPeriod == 'year')?(window.data.interest/window.data.periodicity):window.data.interest ;
  periodicRate = 1 + periodicRate/100;
  window.data.futureValue = futureValueFormula (periodicRate);
  setOptionToValidatedValue('futureValue', window.data.futureValue);
}

function calculateInitialValue () {
  var periodicRate = (window.data.interestPeriod == 'year')?(window.data.interest/window.data.periodicity):window.data.interest ;
  periodicRate = 1 + periodicRate/100;
  var nPeriods     = (window.data.termPeriod == 'year')?(window.data.termLength*window.data.periodicity):window.data.termLength;
  window.data.initialValue = window.data.futureValue
                           + window.data.paymentValue*(Math.pow(periodicRate,nPeriods) - 1)/(periodicRate - 1);
  window.data.initialValue = window.data.initialValue / Math.pow(periodicRate,nPeriods) ;
  setOptionToValidatedValue('initialValue', window.data.initialValue);
}

function calculatePaymentValue () {
  var periodicRate = (window.data.interestPeriod == 'year')?(window.data.interest/window.data.periodicity):window.data.interest ;
  periodicRate = 1 + periodicRate/100;
  var nPeriods     = (window.data.termPeriod == 'year')?(window.data.termLength*window.data.periodicity):window.data.termLength;
  this.data.paymentValue = (window.data.initialValue*Math.pow(periodicRate,nPeriods)  - this.data.futureValue)/(Math.pow(periodicRate,nPeriods) - 1)*(periodicRate - 1);
  setOptionToValidatedValue('paymentValue', window.data.paymentValue);
}

function calculateNumberOfPayments () {
  var periodicRate = (window.data.interestPeriod == 'year')?(window.data.interest/window.data.periodicity):window.data.interest ;
  periodicRate = periodicRate/100 + 1;
  if (window.data.paymentValue < ((periodicRate - 1)*window.data.initialValue - 0.01)) {
    window.data.termLength = Infinity;
    options.termLength.value = '∞';
  }
  var value = window.data.initialValue;
  var i = 0;
  while (value > window.data.futureValue) {
    value *= periodicRate;
    value -= window.data.paymentValue;
    i++;
  }
  i--;
  if (i%12 == 0 && window.data.periodicity == 12) {
    setOptionToValidatedValue('termPeriod',window.data.termPeriod = 'year');
    setOptionToValidatedValue('termLength',window.data.termLength = i/12);
  } else {
    setOptionToValidatedValue('termPeriod',window.data.termPeriod = 'period');
    setOptionToValidatedValue('termLength',window.data.termLength = i);
  }
}

function calculateInterestRate () {
  var lowerBound = 0;
  var upperBound = 1.98;
  var tolerance  = 0.00000001;
  // setThe upperBound
  while (true) {
    var fv = futureValueFormula (upperBound);
    if (fv < window.data.futureValue) {
      upperBound *= 2;
    } else {
      break;
    }
  }
  while ((upperBound - lowerBound) > tolerance) {
    var newIntermediate = (upperBound + lowerBound)/2;
    var fv = futureValueFormula (newIntermediate);
    if (fv < window.data.futureValue) {
      lowerBound = newIntermediate;
    } else {
      upperBound = newIntermediate;
    }
  }
  var newIntermediate = ((upperBound + lowerBound)/2 - 1)*100;
  if (this.data.interestPeriod == 'year') {
    setOptionToValidatedValue('interest', window.data.interest = window.data.periodicity*newIntermediate);
  } else {
    setOptionToValidatedValue('interest', window.data.interest = newIntermediate);
  }
}

function createAmortizationSchedule () {
  calculateBlank ();
  chrome.app.window.create('amortization.html',{
	id: 'amortizationSchedule'},
	function (amortWindow) {
	   amortWindow.contentWindow.data = window.data;
	});
}



window.addEventListener('load', function() {
  var adjustedWidth = window.outerWidth-10;
  adjustElementToSpread(options.initialValue,options.initialValue,adjustedWidth);
  adjustElementToSpread(options.interest, options.interestPeriod,adjustedWidth - 3);
  adjustElementToSpread(options.termLength, options.termPeriod,adjustedWidth - 3);
  adjustElementToSpread(options.paymentValue, options.periodicityPeriod,adjustedWidth - 3);
  adjustElementToSpread(options.futureValue, options.futureValue,adjustedWidth);
  
  loadSynchronizedElementsWithDefaults ({
    initialValue: 100000,
    interest: 8.0,
    interestPeriod: 'year',
    termLength: 30,
    termPeriod: 'year',
    paymentValue: 0,
    periodicity: 12,
    periodicityPeriod: 'months',
    futureValue: 0,
    calculate: 'paymentValue'
  });
});
