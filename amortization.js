/**
 * amortization.js
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
function valueToDollarAmount (value) {
  var isNegative = value < 0;
  value = Math.abs(value);
  var lengthOfFixed = value.toFixed().length; 
  var sourceString = value.toFixed(2);
  var lengthOfFixed = sourceString.replace(/\..*$/,'').length; 
  lengthOfFixed = (lengthOfFixed%3 == 0)?3:lengthOfFixed%3;
  var destString = isNegative?'(':'';
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

function valueToDollarAmountCell (value) {
  var dollarDiv = document.createElement('div');
  dollarDiv.appendChild(document.createTextNode('$'));
  dollarDiv.setAttribute('class','dollarSign');
  var td = document.createElement('td');
  td.appendChild(dollarDiv);
  td.appendChild(document.createTextNode(valueToDollarAmount(value)));
  td.setAttribute('class','money');
  return td;
}

function createAmortizationSchedule () {
  var interestRateNormalized;
  if (data.interestPeriod == 'year') {
    interestRateNormalized = data.interest;
  } else {
    interestRateNormalized = data.interest*data.periodicity;
  }
  
  var body = document.getElementsByTagName('body')[0]; 
  var termElements = [];
  if (data.termPeriod == 'year') {
    termElements = 
      [ document.createElement('dt'), 
        document.createElement('dd')];
    termElements[0].appendChild(document.createTextNode('Term'));
    termElements[1].appendChild(document.createTextNode(data.termLength + ' years'));
  }
  var noPayments = ((data.termPeriod == 'year')?(data.termLength*data.periodicity):data.termLength);
  var noPaymentsElements = 
    [ document.createElement('dt'),
      document.createElement('dd')];
  noPaymentsElements[0].appendChild(document.createTextNode('Number of payments'));
  noPaymentsElements[1].appendChild(document.createTextNode('' + noPayments));
  
  var dl = document.createElement('dl');
  var dItem    = document.createElement('dt');
  dItem.appendChild(document.createTextNode('Loan amount'));
  dl.appendChild(dItem);
  
  dItem = document.createElement('dd');
  dItem.appendChild(document.createTextNode('$ ' + valueToDollarAmount (data.initialValue)));
  dl.appendChild(dItem);
  
  dItem = document.createElement('dt');
  dItem.appendChild(document.createTextNode('Interest rate'));
  dl.appendChild(dItem);
  
  dItem = document.createElement('dd');
  dItem.appendChild(document.createTextNode('' + interestRateNormalized.toFixed(3) + '%'));
  dl.appendChild(dItem);
  
  termElements.forEach(function (node) {
    dl.appendChild(node);
  });
  noPaymentsElements.forEach(function (node) {
    dl.appendChild(node);
  });
  
  dItem = document.createElement('dt');
  dItem.appendChild(document.createTextNode('Periodic payment'));
  dl.appendChild(dItem);
  
  dItem = document.createElement('dd');
  dItem.appendChild(document.createTextNode('$ ' + valueToDollarAmount (data.paymentValue)));
  dl.appendChild(dItem);
  
  dItem = document.createElement('dt');
  dItem.appendChild(document.createTextNode('Total interest paid'));
  dl.appendChild(dItem);
  
  dItem = document.createElement('dd');
  dItem.appendChild(document.createTextNode('$ ' + valueToDollarAmount (data.paymentValue*noPayments - data.initialValue - data.futureValue)));
  dl.appendChild(dItem);
  
  var cell1 = document.createElement('td');
  cell1.appendChild(document.createTextNode('0'));
  cell1.setAttribute('class','integer');
  
  var tr = document.createElement('tr');
  tr.appendChild(cell1);
  tr.appendChild(document.createElement('td'));
  tr.appendChild(document.createElement('td'));
  tr.appendChild(valueToDollarAmountCell (data.initialValue));
  tr.setAttribute('class','even');
  
  var trh = document.createElement('tr');
  
  var th = document.createElement('th');
  th.appendChild(document.createTextNode('Period'));
  trh.appendChild(th);
  
  th = document.createElement('th');
  th.appendChild(document.createTextNode('Interest'));
  trh.appendChild(th);
  
  th = document.createElement('th');
  th.appendChild(document.createTextNode('Principal'));
  trh.appendChild(th);
  
  th = document.createElement('th');
  th.appendChild(document.createTextNode('Remaining balance'));
  trh.appendChild(th);
  
  var table = document.createElement('table');
  
  table.appendChild(trh);
  table.appendChild(tr);
  
  var presentValue = data.initialValue;
  var periodicRate = (data.interestPeriod == 'year')?(data.interest/data.periodicity):data.interest ;
  periodicRate = periodicRate/100;
  for (var i = 1; i <= noPayments; i++) {
    var currentInterest  = periodicRate*presentValue;
    var currentPrincipal = data.paymentValue - currentInterest;
    var rowClass = (i%2)?'odd':'even';
    presentValue -= currentPrincipal;
    
    var integerCell = document.createElement('td');
    integerCell.appendChild(document.createTextNode('' + i));
    integerCell.setAttribute('class','integer');
    
    var tr = document.createElement('tr');
    tr.appendChild(integerCell);
    tr.appendChild(valueToDollarAmountCell (currentInterest));
    tr.appendChild(valueToDollarAmountCell (currentPrincipal));
    tr.appendChild(valueToDollarAmountCell (presentValue));
    tr.setAttribute ('class',rowClass);
    table.appendChild(tr);
  }
  
  var h1 = document.createElement('h1');
  h1.appendChild(document.createTextNode('Amortization Schedule'));
  
  body.appendChild(h1);
  body.appendChild(dl);
  body.appendChild(table);
}

window.addEventListener('load', function() {
  createAmortizationSchedule ();
});
