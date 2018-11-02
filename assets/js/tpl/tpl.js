
const xnTPL = (function() {

  const TPL = (function () {
    return {
      patterns: {
        oneValid: new RegExp("{{[ \r\n]*([^ {}\r\n]+)+[^{}]*}}"),
        // allValid: new RegExp("{{[ \r\n]*([^ {}\r\n]+)+([\| A-z0-9:]+)?[^{}]*}}", 'gim'),
        allValid: new RegExp("{{[ \r\n]*([^ {}\r\n]+)+([\| A-z0-9:]+)?[^{}]*}}"),
        // allValid: new RegExp("{{[ \r\n]*([^{}\r\n]+)+[^{}]*}}", 'gm'),
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
        // path = path.replace(/ /g, '');
        path = path.trim();

        let preOperator = path.substr(0,1);
        let postOperators = path.split('|');

        // console.log('extractOperators path: '+JSON.stringify(path)+' | preOperator: '+JSON.stringify(preOperator)+' | postOperators: ', JSON.stringify(postOperators));

        path = postOperators.shift();
        path = path.replace(/!/g, '').replace(/\*/g, '');
        // console.log('extractOperators path after shift: '+JSON.stringify(path)+' | postOperators: '+JSON.stringify(postOperators));

        if(preOperator === '!'){
          // console.log('extractOperators preOperator: NOT exists: ', TPL.operators.not.includes(path));
          if( ! TPL.operators.not.includes(path)){ TPL.operators.not.push( path ); }
        }
        else if(preOperator === '*'){
          // console.log('extractOperators preOperator: RANGE exists: ', TPL.operators.range.includes(path));
          if( ! TPL.operators.range.includes(path)){ TPL.operators.range.push( path ); }
        }

        if( postOperators.length ){
          TPL.operators.format[path] = postOperators.shift().split(':').map( p => p.trim() ).filter(p => !!p);
        }
        // console.log('extractOperators path: '+path+' | operators: ', JSON.stringify(TPL.operators));

        return path;
      },
      getPathArray(path) {
        let pathStr = TPL.extractOperators(path), realPath = pathStr.slice();

        // console.log('getPathArray extracted path: '+path+' | realPath: '+realPath+' | operators: ', TPL.operators);

        let match, n = 1, newObj;

        while(match = new RegExp(/\[[ \r\n]*([^ "'\[\]\r\n]+)+[^\[\]]*\]/, 'g').exec(realPath)) {
          // console.log('getPathArray realPath match '+(n++)+': ', match);
          newObj = TPL.getObjectFromPath( match[1], TPL.vars);
          if(typeof newObj === 'object'){ newObj = newObj[ match[1] ]; }

          realPath = realPath.replace( match[0], '.'+newObj );
          if(n > 100){ break; }
        }

        // E.g: change t['1'] to t.1
        let realPathArray = realPath.replace(/\[ *["']/g, '.').replace(/ *["']\]/g, '');

        realPathArray = realPathArray.split('.').map( p => p.trim() ).filter(p => !!p);

        // console.log('getPathArray after matchReplace path: '+path+' | realPath: '+realPath+' | realPathArray: '+ realPathArray, ' | operators: ', TPL.operators);

        return [pathStr, realPath, realPathArray];
      },
      getObjectFromPath(path, rowObj) {
        // console.log('getObjectFromPath path: ', JSON.stringify(path) );
        let [pathStr, realPath, realPathArray] = (typeof path === 'string') ? TPL.getPathArray(path) : [ path.join('.'), path ];

        let nextKey = '';
        let negate = TPL.operators.not.includes(pathStr),
            range = TPL.operators.range.includes(pathStr),
            format = TPL.operators.format.hasOwnProperty(pathStr);
        // console.log('getObjectFromPath path: ', JSON.stringify(path), ' | realPathArray: '+JSON.stringify(realPathArray)+' | realPath: '+realPath+' | pathStr: '+pathStr);

        const objValue = (prop, parentObj) => {
          // console.log('getObjectFromPath objValue prop: ', prop, ' | parentObj: ', parentObj);

          return prop.reduce((obj, i) => {
            if( ! obj.hasOwnProperty(i)){
              nextKey = TPL.getTEMP(path);
              if( nextKey && TPL.vars.hasOwnProperty(nextKey) ){ return ''; }
              else{ throw new Error(`Object property "${i}" is undefined`); }
            }
            return obj[i];
          }, parentObj);
        };

        let newValue = objValue(realPathArray, rowObj);
        // console.log('getObjectFromPath realPathArray: '+realPathArray+' | nextKey: '+nextKey+' | newValue: ', newValue, ' | rowObj: ', rowObj);

        if( ! newValue && nextKey){
          newValue = objValue(realPathArray, TPL.vars);
        }

        // console.log('getObjectFromPath final format: '+format+' | negate: '+negate+' | range: '+range+' | newValue: ', newValue);

        let finalValue = negate ? !newValue : newValue;

        if(format){
          TPL.operators.format[ pathStr ]
            .map( name => TPL.formats[ name ] || null)
            .filter( callback => typeof callback === 'function')
            .forEach( callback => {
              finalValue = callback.call(undefined, finalValue);
              // console.log('getObjectFromPath callback: finalValue: ', finalValue);
            });
        }

        // console.log('getObjectFromPath finalValue: ', finalValue);
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

  // 1.) DOM Iterator
  const iterateDOM = (function() {
    const htmlIterator = {
      patterns: { ...TPL.patterns },
      config: { selector: 'xn', templateClass: 'tpl-group' },
      getProps(element) {
        // console.log('getProps element: ', element);
        let selector = htmlIterator.config.selector;
        let AttrMX = element.attr(selector), parts = AttrMX.split(':');

        return parts.map( value => {
          let invalid = parts.length !== 2 || !value || typeof value !== 'string';
          if(invalid) { throw new Error(`Invalid [${selector}] Attribute`); }
          return value;
        });
      },
      validateRoot(element, parentObj) {
        // console.log('validateRoot element: ', element);
        let propObj;
        let [TEMP, PROP] = htmlIterator.getProps( element );
        // console.log('validateRoot TEMP: '+TEMP+' | PROP: ', JSON.stringify(PROP));

        let newPROP = TPL.extractOperators(PROP);
        let isRangeObj = TPL.operators.range.includes(newPROP);
        // console.log('validateRoot TEMP: '+TEMP+' | extracted newPROP: ', JSON.stringify(newPROP));

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

          // console.log('validateRoot TEMP: '+TEMP+' | newPROP: ', newPROP, ' | newParentObj: ', parentObj);
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
          // let XnIf = $(e).attr('xnIf'), newAttr = `{{${XnIf}}}`;
          let XnIf = $(this).attr('xnIf'), newAttr = `{{${XnIf}}}`;
          // console.log('tag_XnIf_Attributes XnIf'+JSON.stringify(XnIf), ' | has { at: '+ XnIf.indexOf('{')+' | has } at: '+XnIf.indexOf('}'));
          if(XnIf && (!XnIf.includes('{') || !XnIf.includes('}')) ){
            newAttrs.push( newAttr );
            html = html.replace( new RegExp(XnIf, 'g'),  newAttr);
            // console.log('tag_XnIf_Attributes newAttr'+JSON.stringify(newAttr));
          }
        });
        return [html, newAttrs];
      },
      replaceVars(HTML, TEMP, rowObj) {
        let match, newAttrs;
        [HTML, newAttrs] = htmlIterator.tag_XnIf_Attributes(HTML);
        // console.log('replaceVars HTML in newAttrs: '+newAttrs+' HTML 11: '+JSON.stringify(HTML));
        // console.log('replaceVars newAttrs: ', newAttrs);

        while(match = htmlIterator.patterns.allValid.exec(HTML)) {
          // console.log('replaceVars match: ', JSON.stringify(match));
          // E.g placeHolder: {{v.code}} | objPath: v.code
          // let [placeHolder, objPath] = [...match];
          let [placeHolder, objPath, pipes] = [...match];
          objPath = [objPath, pipes].join('');

          let cellText = '', parentObj;

          parentObj = TEMP === TPL.getTEMP( objPath ) ? rowObj : TPL.vars;
          cellText = TPL.getObjectFromPath(objPath, parentObj);
          // if( ! cellText && isNaN( Number(cellText) )){ cellText = ''; }
          // console.log('replaceVars cellText: '+JSON.stringify(cellText)+' | match: ', match, '| rowObj: ', rowObj);

          if(newAttrs.indexOf(placeHolder) >= 0) { cellText = TPL.stringValue( cellText ); }
          // console.log('replaceVars HTML before placeHolder: '+placeHolder+' HTML: '+JSON.stringify(HTML));

          let expression = placeHolder.replace(objPath, cellText).replace( new RegExp("[{}]*", 'g'), '');
          // console.log('replaceVars placeHolder expression after: '+JSON.stringify(expression));

          // HTML = HTML.replace( new RegExp("{{[ \r\n]*("+ objPath+")[^{}]*}}", 'gm'), cellText );
          // HTML = HTML.replace(new RegExp(objPath, 'gi'), cellText).replace( new RegExp("[{}]*", 'gm'), '');
          // let exp = new RegExp("{{[^{}]*("+ objPath +")[^{}]*}}", 'gm');
          // console.log('RegExp exp: '+ exp+' | matches: ', exp.exec(HTML));
          // HTML = HTML.replace( exp, cellText );

          HTML = HTML.replace( placeHolder, expression ).replace( new RegExp("[{]{3,}", 'g'), '{{').replace( new RegExp("[}]{3,}", 'g'), '}}');
          // match = htmlIterator.patterns.allValid.exec(HTML);
          // console.log('replaceVars cellText: '+JSON.stringify(cellText)+' | match: ', match, '| final HTML: ', JSON.stringify(HTML));

          // if(objPath.includes('[') || objPath.includes(']')) {
          // HTML = HTML.replace(objPath, cellText).replace( new RegExp("[{}]*", 'gm'), '');
          // }
          // console.log('replaceVars TEMP: '+TEMP+' | objPath: '+JSON.stringify(objPath)+' | cellText: '+cellText+' | HTML after: '+JSON.stringify(HTML));
          // console.log('replaceVars TEMP: '+TEMP+' | cellText: '+cellText+' | objPath: '+JSON.stringify(objPath)+' | operators: '+JSON.stringify(TPL.operators));
        }

        return HTML;
      },
      /*updateDOM_2(MXElement) {
        // E.g for 'v:items', TEMP => 'v', PROP => 'items', VALUE => VARS['items'] => [[...}]
        let [ TEMP, PROP, VALUE ] = htmlIterator.validateRoot( MXElement, TPL.vars );
        // let [ TEMP, PROP, VALUE ] = MXElement.data('params');
        // console.log('updateDOM TEMP: '+TEMP+' | PROP: '+PROP+' | VALUE: ', JSON.stringify(VALUE));
        console.log('updateDOM TEMP: '+TEMP+' | PROP: '+PROP);
        if(TEMP === 'v'){
          // console.log('updateDOM VALUE: ', JSON.stringify(TPL.vars));
        }

       let [ TEMP, PROP, VALUE ] = htmlIterator.validateRoot( MXElement, TPL.vars );
       if(VALUE) {
          // let isArrayVar = false;

          if(TPL.operators.range.indexOf(PROP) >= 0) {
            // console.log('updateDOM TPL.operators.range VALUE: ', JSON.stringify(VALUE));
          }

          /!*if(TPL.operators.range.indexOf(PROP) >= 0 && typeof VALUE === 'number') {
            TPL.operators.range.splice(TPL.operators.range.indexOf(PROP), 1);
            isArrayVar = true;

            let newValue = [];
            for(let n = 1; n <= Number(VALUE); n++){ newValue.push(n); }
            VALUE = newValue;

          }else *!/
          if (!Array.isArray(VALUE)) {
            VALUE = [VALUE];
          }
          console.log('updateDOM iter VALUE: ', JSON.stringify(VALUE));

          // De-fragment content if <template/> element
          if( $(MXElement).is("template") ) {
            MXElement = htmlIterator.stripTemplates( MXElement );
          }

          // final return value
          return VALUE.map( (rowObj, i) => {

            TPL.vars[ TEMP ] = rowObj;

            let HTML = '', elementGroup = [];

            if( ! MXElement.children().length ){
              let text = MXElement.text().toString().trim();
              /!*let match = htmlIterator.patterns.oneValid.exec(text);

              if(match && match.length) {
                // text = htmlIterator.replaceVars(text, TEMP, rowObj);
              }*!/

              let match;
              while(match = TPL.patterns.allValid.exec(text)) {
                // let [placeHolder, objPath] = [...match];
                let [placeHolder, objPath, pipes] = [...match];
                objPath = [objPath, pipes].join('');
                // console.log('updateDOM placeHolder: '+placeHolder+' | match: ', match, ' | objPath: ', objPath);

                let textObj = TPL.getObjectFromPath(objPath, rowObj) || '';
                // if(textObj) { textObj = TPL.stringValue( textObj ); }

                text = placeHolder.replace(objPath, textObj).replace( new RegExp("[{}]*", 'gm'), '');
                // console.log('updateDOM typeof textObj: ', typeof textObj, 'textObj: ', textObj );
              }

              elementGroup.push( text );
              // elementGroup.push( (match && match.length) ? rowObj : text );
              console.log('updateDOM TEMP '+TEMP+' No children text: '+text+' | match; ', match);

            }else{
              MXElement.children().each(function (i, elem) {
                console.log('updateDOM TEMP '+TEMP+' elem: ', elem);

                // De-fragment content if <template/> element
                if( $(elem).is("template") ) {
                  let newElem = htmlIterator.stripTemplates( elem );
                  $('<div/>').html( newElem ).children().each(function (j, tmp) {
                    elem = tmp;
                  });
                  console.log('updateDOM template elem: ', elem, ' | newElem: ', newElem);
                }

                // If Element itself has [TPL] attribute
                if( elem.hasAttribute( htmlIterator.config.selector ) ) {
                  console.log('updateDOM next CALL elem: ', elem);

                  htmlIterator.updateDOM($(elem)).forEach(html => {
                    elementGroup.push(html);
                  });

                }else if( htmlIterator.getDirectTPLChildren(TEMP, elem).length > 0 ) {
                  let elem_2 = $(elem).clone(), outerHTML = [ elem_2.html('')[0].outerHTML, elem_2.text() ];

                  const drillDown = (targetElement) => {
                    $(targetElement).children().each(function (j, childElement) {

                      // If current childElement has [TPL] attribute
                      if( childElement.hasAttribute( htmlIterator.config.selector ) ) {
                        console.log('updateDOM next CALL childElement: ', childElement);

                        let newElem = htmlIterator.updateDOM( $(childElement) );

                        outerHTML.reverse().forEach( oHtml => {
                          newElem = $( oHtml[0] ).html(newElem);
                        });

                        elementGroup.push( newElem[0].outerHTML );
                        console.log('updateDOM after next CALL elementGroup: ', JSON.stringify(elementGroup));

                      }else{
                        let childElement_2 = $(childElement).clone();

                        outerHTML.push( [childElement_2.html('')[0].outerHTML, childElement_2.text()] );
                        console.log('updateDOM next outerHTML: ', JSON.stringify(outerHTML));

                        drillDown(childElement);
                      }
                    });
                  };

                  drillDown(elem);

                }else if( htmlIterator.getAnyTPLChildren(TEMP, elem).length > 0 ) {
                  let elem_2 = $(elem).clone(), outerHTML = [ elem_2.html('')[0].outerHTML, elem_2.text() ];

                  const drillDown = (targetElement) => {
                    $(targetElement).children().each(function (j, childElement) {

                      // If current childElement has [TPL] attribute
                      if( childElement.hasAttribute( htmlIterator.config.selector ) ) {
                        console.log('updateDOM next CALL childElement: ', childElement);

                        let newElem = htmlIterator.updateDOM( $(childElement) );

                        outerHTML.reverse().forEach( oHtml => {
                          newElem = $( oHtml[0] ).html(newElem);
                        });

                        elementGroup.push( newElem[0].outerHTML );
                        console.log('updateDOM after next CALL elementGroup: ', JSON.stringify(elementGroup));

                      }else{
                        let childElement_2 = $(childElement).clone();

                        outerHTML.push( [childElement_2.html('')[0].outerHTML, childElement_2.text()] );
                        console.log('updateDOM next outerHTML: ', JSON.stringify(outerHTML));

                        drillDown(childElement);
                      }
                    });
                  };

                  drillDown(elem);

                }else{
                  HTML = TPL.validateMarkup( $(elem).clone()[0].outerHTML );
                  console.log('updateDOM TEMP '+TEMP+' else HTML: ', JSON.stringify(HTML));

                  HTML = htmlIterator.replaceVars(HTML, TEMP, rowObj);
                  console.log('updateDOM TEMP '+TEMP+' else HTML after replaceVars: ', JSON.stringify(HTML));

                  elementGroup.push( HTML );
                }
              });
            }

            console.log('updateDOM TEMP '+TEMP+' elementGroup: ', elementGroup);

            let oneParent = (MXElement.clone().addClass('tpl-tmp').html(''))[0].outerHTML;
            let matchParent = htmlIterator.patterns.oneValid.exec(oneParent);
            // console.log('updateDOM TEMP '+TEMP+' matchParent: ', matchParent);

            // if( MXElement.children().length ) {
              oneParent = TPL.validateMarkup( oneParent );
              oneParent = htmlIterator.replaceVars(oneParent, TEMP, rowObj);
            // }

            return $(oneParent).html( elementGroup.join('') )[0].outerHTML;
          });
        }
      },*/
      createElements(MXElement) {
        if ( MXElement.is("template") ) {
          MXElement = htmlIterator.stripTemplates(MXElement);
        }

        // console.log('createElements -TEXT- INITIAL MXElement: ', MXElement.clone().html('')[0].outerHTML,' | MXElement children: ', MXElement.children().length);

        let TEMP, PROP, VALUE;

        if( MXElement.attr( htmlIterator.config.selector ) ) {
          [ TEMP, PROP, VALUE ] = htmlIterator.validateRoot( MXElement, TPL.vars );
          if (!Array.isArray(VALUE)) { VALUE = [VALUE]; }
          // console.log('createElements iteration VALUE: ', JSON.stringify(VALUE));
        }

        // console.log('createElements TEMP: '+TEMP+' | PROP: '+PROP+' | VALUE: ', JSON.stringify(VALUE));
        let elementGroup = [];

        if ( ! MXElement.children().length ) {

          let MXHtml = MXElement.clone()[0].outerHTML;

          TPL.validateMarkup( MXHtml );

          if(VALUE){
            VALUE.forEach( (rowObj, index) => {
              TPL.vars[ TEMP ] = rowObj;

              let newMXHtml = htmlIterator.replaceVars( MXHtml, TEMP, rowObj );
              // console.log('createElements newMXHtml EACH after replaceVars: ', JSON.stringify(newMXHtml));

              // elementGroup.push( { element: newMXHtml, children: [] } );
              elementGroup.push( newMXHtml );
            });

          }else{
            let newMXHtml = htmlIterator.replaceVars( MXHtml, '', {} );
            // console.log('createElements newMXHtml ONE after replaceVars: ', JSON.stringify(newMXHtml));
            // elementGroup.push( { element: newMXHtml, children: [] } );
            elementGroup.push( newMXHtml );
          }

          // console.log('createElements Element elementGroup: ', elementGroup);
          return elementGroup;

        // ===================================================================
        } else {

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
                // console.log('createElements forEach Children childElementsGroup: ', childElementsGroup);

              });

              // let MXHtml = MXElement.html('')[0].outerHTML;
              // let newMXHtml = htmlIterator.replaceVars( MXHtml, '', {} );

              // let newMXHtml = MXElement.clone();
              // newMXHtml.html( childElementsGroup.join('') );
              let newMXHtml = MXElement.clone().html( 'html' );
              newMXHtml = htmlIterator.replaceVars( newMXHtml[0].outerHTML, '', {} );
              newMXHtml = newMXHtml.replace( 'html', childElementsGroup.join('') );

              // console.log('createElements forEach newMXHtml PARENT after replaceVars: ', newMXHtml);

              elementGroup.push( newMXHtml );
            });

          }else{
            let childElementsGroup = [];

            MXChildren.each(function (i, elem) {

              htmlIterator.createElements( $(this) ).map( newElement => {
                childElementsGroup.push( newElement );
              });
              // console.log('createElements forOne Children childElementsGroup: ', childElementsGroup);

            });

            // let MXHtml = MXElement.clone().html('')[0].outerHTML;
            // let newMXHtml = htmlIterator.replaceVars( MXHtml, '', {} );

            let newMXHtml = MXElement.clone().html( 'html' );
            newMXHtml = htmlIterator.replaceVars( newMXHtml[0].outerHTML, '', {} );
            newMXHtml = newMXHtml.replace( 'html', childElementsGroup.join('') );

            // console.log('createElements forOne newMXHtml PARENT after replaceVars: ', newMXHtml);

            elementGroup.push( newMXHtml );
          }

          // console.log('createElements Children PARENT+CHILD elementGroup: ', elementGroup);

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
        const TplDOM = $(document).find('[tpl]');

        const HasAttrMX = `[${htmlIterator.config.selector}]`;

        const NoParentMX = (i, elem) => !$(elem).parents( HasAttrMX ).length;

        const TPL_MX = TplDOM.find( HasAttrMX );
        const TPLElements = TPL_MX.filter( NoParentMX );

        /*TPL_MX.each(function (i,e) {
          // E.g for 'v:items', TEMP => 'v', PROP => 'items', VALUE => VARS['items'] => [[...}]
          let [ TEMP, PROP, VALUE ] = htmlIterator.validateRoot( $(this), TPL.vars );
          console.log('iterate each TEMP: '+TEMP+' | PROP: '+PROP+' | VALUE: ', JSON.stringify(VALUE));

          TPL.vars[ TEMP ] = VALUE;

          $(this).data('params', [ TEMP, PROP, VALUE ]);
        });*/

        // console.log('iterate TPL.vars: ', JSON.stringify(TPL.vars));

        new Promise( (resolve, reject) => {

          TplDOM.each(function (i, elem) {
            let newTPLElements = htmlIterator.createElements( $(this) );
            // console.log('iterate each newTPLElem: ', newTPLElements);

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

          // TplDOM.find( `${HasAttrMX}:not('.tpl-tmp')` ).remove();
          // TplDOM.find( `.tpl-tmp` ).removeClass('tpl-tmp');
          // try { TplDOM.find( "[xnIf]" ).trigger('TPL.iterate'); }
          // catch(error) {}
          // finally { TplDOM.find( HasAttrMX ).removeAttr( htmlIterator.config.selector ); }

        }).catch((error) => {
          console.log(error);
        });

      }
    };

    return () => htmlIterator.iterate();
  })();


  $(document)
    .on({
      'TPL.iterate': function() {
        // let match, XnIf = $(this).attr('xnIf'), expression;
        // console.log('TPL.iterate XnIf: '+JSON.stringify(XnIf)+' | TPL.vars: ', JSON.stringify(TPL.vars));

        /*while(match = TPL.patterns.allValid.exec(`{{${XnIf}}}`)) {
          let [placeHolder, objPath] = [...match];
          // console.log('TPL.iterate XnIf: ', JSON.stringify(XnIf));

          XnIf = TPL.getObjectFromPath(objPath, TPL.vars) || '';
          // console.log('TPL.iterate XnIf Obj: ', JSON.stringify(XnIf));
          // if( XnIf && typeof XnIf ==='string' ){ XnIf = JSON.stringify(XnIf); }
          // if(XnIf) { XnIf = TPL.stringValue( XnIf ); }

          expression = placeHolder.replace(objPath, XnIf).replace( new RegExp("[{}]*", 'gm'), '');
          // expression = placeHolder.replace( new RegExp("[{}]*", 'gm'), '');
          // console.log('TPL.iterate placeHolder: '+placeHolder+' | match: ', match, ' | objPath: ', objPath, ' | XnIf: ', typeof XnIf, 'expression: ', expression );
          // console.log('TPL.iterate eval: ', eval( expression ));
        }*/
        /*while(match = TPL.patterns.allValid.exec(`${XnIf}`)) {
          let [placeHolder, objPath] = [...match];

          expression = placeHolder.replace( new RegExp("[{}]*", 'gm'), '');
          // console.log('TPL.iterate placeHolder: '+placeHolder+' | match: ', match, ' | objPath: ', objPath, ' | XnIf: ', typeof XnIf, 'expression: ', expression );
          // console.log('TPL.iterate eval: ', eval( expression ));
        }*/

        /*let match, XnIf = $(this).attr('xnIf');

        if( ! $(this).parents(`[xn]`).length ) {
          while(match = TPL.patterns.allValid.exec(`{{${XnIf}}}`)) {
            let [placeHolder, objPath] = [...match];
            // console.log('TPL.iterate NON-xn XnIf: ', JSON.stringify(XnIf));

            XnIf = TPL.getObjectFromPath(objPath, TPL.vars) || '';
            // console.log('TPL.iterate NON-xn XnIf Obj: ', JSON.stringify(XnIf));
            if(XnIf) { XnIf = TPL.stringValue( XnIf ); }

            XnIf = placeHolder.replace(objPath, XnIf).replace( new RegExp("[{}]*", 'gm'), '');
            // console.log('TPL.iterate NON-xn placeHolder: '+placeHolder+' | match: ', match, ' | objPath: ', objPath, ' | typeof XnIf: ', typeof XnIf, 'XnIf: ', XnIf );
          }
        }

        let expression = XnIf;*/

        let expression = $(this).attr('xnIf');

        // console.log('TPL.iterate expression: ', expression);

        try {
          eval( expression ) ? $(this).removeAttr('xnIf').removeAttr('xnif') : $(this).remove();
        } catch(error) {
          $(this).remove();
          console.log('TPL.iterate eval error: ', error);
        }
      }
    }, "[xnIf],[xnif]");

  // Template Initialization functions
  const initFunctions = [
    iterateDOM
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
    init(data) {
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

      }).catch((error) => {
        console.log(error);
      });
    }
  };

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
