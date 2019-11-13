
const xnTPL = (function() {

  const TplDOM = $(document).find('[tpl]');

  /* TPL :: start */
  const TPL = (function () {
    return {
      patterns: {
        oneValid: new RegExp("{{[ \r\n]*([^ {}\r\n]+)+[^{}]*}}"),
        allValid: new RegExp("{{[ \r\n]*([^ {}\r\n]+)+([\| A-z0-9:]+)?[^{}]*}}"),
        empty: new RegExp("{{[ \r\n]*}}", 'gim'),
        triplePlus: new RegExp("({{3,}[^{}]+}}|{{[^{}]+}{3,})", 'gm'),
        misMatch: new RegExp("({{[^{}]+{|}+[^{}]+}})", 'gi'),
      },

      formats: {},

      vars: {},

      operators: {
        not: [], range: [], format: {}
      },

      getTEMP(path) {
        let [pathStr, realPath, realPathArray] = TPL.getPathArray(path);
        return realPathArray[0];
      },

      validateMarkup(html) {
        let triplePlus = html.match(TPL.patterns.triplePlus);
        let misMatch = html.match(TPL.patterns.misMatch);
        let empty = html.match(TPL.patterns.empty);

        if(empty || triplePlus || misMatch) { throw new Error('Invalid markup'); }

        return html;
      },

      extractOperators(path) {
        path = path.trim();

        let preOperator = path.substr(0,1);
        let postOperators = path.split('|');

        path = postOperators.shift();
        path = path.replace(/!/g, '').replace(/\*/g, '');

        if(preOperator === '!'){
          if( ! TPL.operators.not.includes(path)){ TPL.operators.not.push( path ); }
        }
        else if(preOperator === '*'){
          if( ! TPL.operators.range.includes(path)){ TPL.operators.range.push( path ); }
        }

        if( postOperators.length ){
          TPL.operators.format[path] = postOperators.shift().split(':').map( p => p.trim() ).filter(p => !!p);
        }

        return path;
      },

      getPathArray(path) {
        let pathStr = TPL.extractOperators(path), realPath = pathStr.slice();

        let match, n = 1, newObj;

        while(match = new RegExp(/\[[ \r\n]*([^ "'\[\]\r\n]+)+[^\[\]]*\]/, 'g').exec(realPath)) {
          newObj = TPL.getObjectFromPath( match[1], TPL.vars);
          if(typeof newObj === 'object'){ newObj = newObj[ match[1] ]; }

          realPath = realPath.replace( match[0], '.'+newObj );
          if(n > 100){ break; }
        }

        // E.g: change t['1'] to t.1
        let realPathArray = realPath.replace(/\[ *["']/g, '.').replace(/ *["']\]/g, '');

        realPathArray = realPathArray.split('.').map( p => p.trim() ).filter(p => !!p);

        return [pathStr, realPath, realPathArray];
      },

      getObjectFromPath(path, rowObj) {
        let vars = (typeof path === 'string') ? TPL.getPathArray(path) : [ path.join('.'), path ];

        let [pathStr, realPath, realPathArray] = vars;

        let nextKey = '';
        let negate = TPL.operators.not.includes(pathStr),
            range = TPL.operators.range.includes(pathStr),
            format = TPL.operators.format.hasOwnProperty(pathStr);

        const objValue = (prop, parentObj) => {

          const reduceFunc = (obj, i) => {
            if( ! obj.hasOwnProperty(i)){
              nextKey = TPL.getTEMP(path);
              if( nextKey && TPL.vars.hasOwnProperty(nextKey) ){
                return '';
              }
              else{
                throw new Error(`Object property "${i}" is undefined`);
              }
            }
            if(typeof obj[i] === 'undefined'){
              console.log('pathStr: ', pathStr, 'i: ', i, 'obj: ', obj);
            }
            return obj[i];
          };

          return prop.reduce(reduceFunc, parentObj);
        };

        let newValue = objValue(realPathArray, rowObj);

        if( ! newValue && nextKey){
          newValue = objValue(realPathArray, TPL.vars);
        }

        let finalValue = negate ? !newValue : newValue;

        if(format){
          TPL.operators.format[ pathStr ]
            .map( name => TPL.formats[ name ] || null)
            .filter( callback => typeof callback === 'function')
            .forEach( callback => {
              finalValue = callback.call(undefined, finalValue);
            });
        }

        return finalValue;
      },

      stringValue(cellText) {
        if(typeof cellText !== 'object') {
          try { eval(String(cellText)); } catch (e) { cellText = JSON.stringify(cellText).replace( /"/g, "'"); }
        }
        return cellText;
      },
    }
  })();
  /* TPL :: end */

  /* DOM Iterator :: start */
  const iterateDOM = (function() {

    /* 1.) htmlIterator :: start */
    const htmlIterator = {

      patterns: { ...TPL.patterns },

      config: {
        selector: 'xn', templateClass: 'tpl-group'
      },

      getProps(element) {
        let selector = htmlIterator.config.selector;
        let AttrMX = element.attr(selector), parts = AttrMX.split(':');

        return parts.map( value => {
          let invalid = parts.length !== 2 || !value || typeof value !== 'string';
          if(invalid) { throw new Error(`Invalid [${selector}] Attribute`); }
          return value;
        });
      },

      validateRoot(element, parentObj) {
        let propObj;
        let [TEMP, PROP] = htmlIterator.getProps( element );

        let newPROP = TPL.extractOperators(PROP);
        let isRangeObj = TPL.operators.range.includes(newPROP);

        if(parentObj.hasOwnProperty(newPROP)) {
          propObj = parentObj[ newPROP ];

        }else{
          propObj = TPL.getObjectFromPath( newPROP, parentObj );

          if(isRangeObj){
            if(isNaN(propObj)){
              throw new Error(`${PROP}: "Range" operator can only be used on an integer value`);
            }
            let arrayValue = [];
            for(let n = 1; n <= Number(propObj); n++){ arrayValue.push( {[TEMP]: n} ); }
            propObj = arrayValue;
          }
        }

        if(!propObj) { throw new Error(`Prop "${newPROP}" not found`); }

        if(Array.isArray(propObj) && !isRangeObj) {
          propObj = propObj.map( (obj, i) => {
            obj['i'] = i;  obj['sn'] = i + 1;
            return obj;
          })
        }

        return [ TEMP, newPROP, propObj ];
      },

      getAnyTPLChildren(parentElement) {
        return $(parentElement).find( `[${htmlIterator.config.selector}]` );
      },

      getDirectTPLChildren(parentTEMP, parentElement) {
        return htmlIterator.getAnyTPLChildren(parentElement).filter((i, childElement) => {
          let [_, childPROP ] = htmlIterator.getProps( $(childElement) );
          return parentTEMP === TPL.getTEMP(childPROP);
        });
      },

      tag_XnIf_Attributes(html) {
        let newAttrs = [];

        $(html).wrap('<div/>').parent().find('[xnIf]').each(function (i,e) {
          let XnIf = $(this).attr('xnIf');
          let newAttr = `{{${XnIf}}}`;

          if(XnIf && (!XnIf.includes('{') || !XnIf.includes('}')) ){
            newAttrs.push( newAttr );
            html = html.replace( new RegExp(XnIf, 'g'),  newAttr);
          }
        });
        return [html, newAttrs];
      },

      replaceVars(HTML, TEMP, rowObj) {
        let match, newAttrs;
        [HTML, newAttrs] = htmlIterator.tag_XnIf_Attributes(HTML);

        while(match = htmlIterator.patterns.allValid.exec(HTML)) {
          // E.g placeHolder: {{v.code}} | objPath: v.code
          let [placeHolder, objPath, pipes] = [...match];
          objPath = [objPath, pipes].join('');

          let cellText = '', parentObj;

          parentObj = TEMP === TPL.getTEMP( objPath ) ? rowObj : TPL.vars;
          cellText = TPL.getObjectFromPath(objPath, parentObj);

          if(newAttrs.indexOf(placeHolder) >= 0) { cellText = TPL.stringValue( cellText ); }

          let expression = placeHolder.replace(objPath, cellText).replace( new RegExp("[{}]*", 'g'), '');

          HTML = HTML.replace( placeHolder, expression ).replace( new RegExp("[{]{3,}", 'g'), '{{').replace( new RegExp("[}]{3,}", 'g'), '}}');
        }

        return HTML;
      },

      createElements(MXElement) {
        if ( MXElement.is("template") ) {
          MXElement = htmlIterator.stripTemplates(MXElement);
        }

        let TEMP, PROP, VALUE;

        if( MXElement.attr( htmlIterator.config.selector ) ) {
          [ TEMP, PROP, VALUE ] = htmlIterator.validateRoot( MXElement, TPL.vars );
          if (!Array.isArray(VALUE)) { VALUE = [VALUE]; }
        }

        let elementGroup = [];

        if ( ! MXElement.children().length ) {
          let MXHtml = MXElement.clone()[0].outerHTML;

          TPL.validateMarkup( MXHtml );

          if(VALUE){
            VALUE.forEach( (rowObj, index) => {
              TPL.vars[ TEMP ] = rowObj;

              let newMXHtml = htmlIterator.replaceVars( MXHtml, TEMP, rowObj );

              elementGroup.push( newMXHtml );
            });

          }else{
            let newMXHtml = htmlIterator.replaceVars( MXHtml, '', {} );
            elementGroup.push( newMXHtml );
          }

          return elementGroup;

        }
        else {
          let MXChildren = MXElement.children(), element, children;

          if(VALUE){

            VALUE.forEach( (rowObj, index) => {
              let isRangeObj = TPL.operators.range.includes(PROP);
              if(isRangeObj) { rowObj = rowObj[ TEMP ]; }

              TPL.vars[ TEMP ] = rowObj;

              let childElementsGroup = [];

              MXChildren.each(function (i, elem) {
                htmlIterator.createElements( $(this) ).map( newElement => {
                  childElementsGroup.push( newElement );
                });
              });

              let newMXHtml = MXElement.clone().html( 'html' );
              newMXHtml = htmlIterator.replaceVars( newMXHtml[0].outerHTML, '', {} );
              newMXHtml = newMXHtml.replace( 'html', childElementsGroup.join('') );

              elementGroup.push( newMXHtml );
            });
          }
          else{
            let childElementsGroup = [];

            MXChildren.each(function (i, elem) {
              htmlIterator.createElements( $(this) ).map( newElement => {
                childElementsGroup.push( newElement );
              });
            });

            let newMXHtml = MXElement.clone().html( 'html' );
            newMXHtml = htmlIterator.replaceVars( newMXHtml[0].outerHTML, '', {} );
            newMXHtml = newMXHtml.replace( 'html', childElementsGroup.join('') );

            elementGroup.push( newMXHtml );
          }

          return elementGroup;
        }
      },

      stripTemplates(templateElement) {
        let templateId = templateElement.attr('id');
        let content = document.querySelector( `#${templateId}` ).content;
        let children = document.importNode(content, true);

        let newMXElement = ( templateElement.clone().html('') )[0].outerHTML;
        newMXElement = newMXElement.replace('<template',  '<div').replace('</template>',  '</div>');

        return $(newMXElement).addClass('tmp-wrap').html( children );
      },

      iterate() {
        const HasAttrMX = `[${htmlIterator.config.selector}]`;

        const NoParentMX = (i, elem) => !$(elem).parents( HasAttrMX ).length;

        const TPL_MX = TplDOM.find( HasAttrMX );
        const TPLElements = TPL_MX.filter( NoParentMX );

        new Promise( (resolve, reject) => {
          TplDOM.each(function (i, elem) {
            let newTPLElements = htmlIterator.createElements( $(this) );

            $(this).prev().after( newTPLElements );
            $(this).remove();

            if( (i+1) >= TplDOM.length) { resolve(true); }
          });

        }).then(() => {
          const NewTplDOM = $(document).find('[tpl]');

          NewTplDOM.find( `.tpl-tmp` ).remove();
          NewTplDOM.find( `.tpl-wrap` ).unwrap();

          try { NewTplDOM.find( "[xnIf],[xnif]" ).trigger('TPL.iterate'); }
          catch(error) {}
          finally {
            NewTplDOM.find( HasAttrMX ).removeAttr( htmlIterator.config.selector );
          }

        }).catch((error) => {
          console.log(error);
        });
      }
    };
    /* htmlIterator :: end */

    return () => htmlIterator.iterate();
  })();
  /* DOM Iterator :: end */


  $(document).on({
    'TPL.iterate': function() {
      let expression = $(this).attr('xnIf');

      try {
        eval( expression ) ? $(this).removeAttr('xnIf').removeAttr('xnif') : $(this).remove();
      }
      catch(error) {
        $(this).remove();
        console.log('TPL.iterate eval error: ', error);
      }
    }
  }, "[xnIf],[xnif]");


  // Template Initialization functions
  const initFunctions = [
    iterateDOM  // DOM Iterator
  ];


  /** ----------------------------------------------
   * ============  P U B L I C   A P I  ============
   */
  return {
    pipes(pipes) {
      if(Object.keys(TPL.vars).length) { return; }

      if( !pipes || typeof pipes !== 'object' || !Object.keys(pipes).length) {
        throw new Error(`Invalid parameter supplied for xnTPL().pipes(): A non-empty object literal expected"`);
      }

      Object.keys(pipes).filter( k => typeof pipes[k] === 'function' ).map( k => TPL.formats[ k ] = pipes[k] );

      return this;
    },

    init(data, afterInit) {
      let dataKeys = Object.keys(data);

      if( !data || typeof data !== 'object' || !dataKeys.length) {
        throw new Error(`Invalid parameter supplied for xnTPL().data(): A non-empty object literal expected"`);
      }

      new Promise( (resolve, reject) => {

        dataKeys.forEach( (key, index) => {
          TPL.vars = { ...TPL.vars, ...data[ key ] };
          if( (index+1) >= dataKeys.length ){ resolve(true); }
        });

      }).then(() => {
        initFunctions.forEach( callback => { callback.call(undefined); });

        if( typeof afterInit === 'function') {
          afterInit.call(undefined);
        }

        // Display TplDOM
        Spinner.hide();

      }).catch((error) => {
        console.log('Init error: ', error);
      });
    }
  };
  /* ----------------------------------------------
   * =======  P U B L I C   A P I  ENDS  =========*/

});

// Dynamically load scripts
/*[ 'tpl/tpl.js' ].map( src => {
  let element = document.createElement("script");
  element.src = "assets/js/" + src;
  return !!document.body.appendChild(element);
});*/


// Sample: how to run
/*
  xnTPL().data({
    data_1: ajaxResult, data_2: { org: { test: true } }
  });
*/
