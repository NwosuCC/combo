
const ObjectUtil = (function () {

  const ObjectUtilObj = {
    sanitizeValue(value, defaultValue = "") {
      return ObjectUtilObj.isEmpty( value ) ? defaultValue : value;
    },
    isEmpty(value) {
      const Empties = ['undefined', 'null', 'NaN', 'false', '0', ''];
      return !Array.isArray(value) && Empties.includes( String(value).trim() );
    },
    spliceObject(keys, obj, newObj) {
      if( typeof newObj !== 'object'){ newObj = {}; }

      keys.forEach( k => { newObj[ k ] = obj.hasOwnProperty(k) ? obj[ k ] : null; });

      return newObj;
    },
    getObjectValue(path, originalObj) {
      originalObj = ObjectUtil.sanitizeValue( originalObj );

      if( typeof originalObj !== 'object' ) { return null; }

      return path.split('.').reduce(function(obj, i) {
        return ObjectUtil.sanitizeValue( obj[i] ) ? obj[i] : null;
      }, originalObj);
    }
  };

  return ObjectUtilObj

})();


const StringUtil = (function () {

  const StringUtilObj = {
    upperCase(string) {
      return String( string ).toUpperCase();
    },
    lowerCase(string) {
      return String( string ).toLowerCase();
    },
    titleCase(string) {
      if (ObjectUtil.isEmpty(string)) { return ''; }

      let newWords = [], words = String( string ).toLowerCase().split(" ");

      words.forEach( (word, i) => {
        let characters = StringUtilObj.trimMultipleSpaces(word).toLowerCase().split("");
        newWords[i] = characters.shift().toUpperCase() + characters.join("");
      });

      return newWords.join(" ");
    },
    trimMultipleChars(text, character) {
      text = ObjectUtil.sanitizeValue(text, '');
      return String( text ).split(character).filter( item => !!item ).join(character).trim();
    },
    trimMultipleSpaces(text) {
      return StringUtilObj.trimMultipleChars(text, ' ');
    },
    trimAllSpaces(text) {
      return String( text ).replace(/ /g, '');
    },
    spaceToChar(text, char) {
      return String( text ).replace(/ /gi, char);
    },
    charToSpace(text, char) {
      return String( text ).replace(new RegExp(char, 'gi'), ' ');
    },
    underscoreToSpace(text) {
      return String( text ).replace(/_/g, " ");
    },
    spaceToUnderscore(text) {
      return String( text ).replace(/ /g, "_");
    },
    stripNonPrintableChars(text) {
      return String( text ).replace(/[^ -~]+/g, "");
    },
    padString(text, char, desiredLength, side) {
      text = String( text );  char = String( char );

      if (["left", "right"].indexOf(side) < 0) { side = "right"; }

      let characters = text.split("");
      let stringLength = characters.length;
      let padLength = desiredLength - stringLength;

      for (let c = 1; c <= padLength; c++) {
        text = (side === "right") ? text + char : char + text;
      }

      return text;
    },
    asCurrency(number, useGrouping) {
      useGrouping = useGrouping !== false;
      number = StringUtilObj.asNumber(number);
      return number.toLocaleString(undefined, {useGrouping, minimumFractionDigits: 2, maximumFractionDigits: 2});
    },
    asNumber(number) {
      number = ObjectUtil.sanitizeValue(number);
      number = Number( String(number).split(",").join("") );
      return (!isNaN(number)) ? number : 0;
    },
    withOptionalDecimal(number) {
      let newNumber = StringUtilObj.asNumber(number), splitNewNumber = String(newNumber).split('.').map( n => Number(n) );
      let [integer, fraction] = splitNewNumber;
      return ( fraction ) ? newNumber : integer;
    },
    ifNotEmpty(value) {
      if(!isNaN(value)){ value = Number(value); }
      return ! ObjectUtil.isEmpty( value ) ? value : '';
    },

    /* ===================================================================== *
     * Specifically for this App
     * --------------------------------------------------------------------*/
    asSeason(year) {
      if(isNaN(year) || String(year).length !== 4) { return ''; }
      return String(year) + ' / ' + String(year + 1);
    },
    shortLeagueName(league) {
      return ( league && league._key === 'EPL') ? league._key : league.name;
    },
    matchStat(match) {
      return ( match ) ? `${match.club_1.code} vs ${match.club_2.code}` : '';
    },

  };

  return StringUtilObj;

})();


const FormUtil = (function () {

  const FormUtilObj = {
    values( JQuerySelector ) {
      let form = {};

      $( JQuerySelector ).find('input, textarea, select').each(function (i, input) {
        let { name, id, type, tagName } = input, value = '', el = $('#'+id);

        if( el.hasClass('input-currency')){
          el.val(function(){ return StringUtil.asNumber( $(this).val() ); });
        }

        switch(type){
          case 'checkbox': case 'radio': {
            if( !!form[name] ){ return; } // for checkbox Group where one is already checked
            value = el.prop('checked') ? el.val() : '';
          } break;
          case 'textarea': case 'email': case 'text': case 'number': case 'hidden':
          case 'select-one': case 'date' : case 'time' : {
            value = el.val();
          } break;
        }

        form[name] = value;
      });

      return form;
    },
  };

  return FormUtilObj;

})();

