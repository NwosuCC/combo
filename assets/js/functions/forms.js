
const FormHandlers = (function () {

  const formInputs = {
    leagueForm: 'league',
    clubForm: 'club',
    matchForm: 'match',
    ticketForm: 'ticket',
  };

  const FormHandlersObj = {

    submit( formSubmitButton ) {
      let formId = formSubmitButton.attr('form'), formSelector = `form#${formId}`;

      let values = FormUtil.values( formSelector );
      values.input = formInputs[ formId ];
      // console.log('formId: '+formId+' | values: ', values);

      let formValues = FormHandlersObj.stripFormLabel(values);
      // console.log('formId: '+formId+' | formValues: ', formValues);

      $.ajax({
        type: "POST",
        data: formValues ,
        success: function(result, status, xhr){
          $(formSelector)[0].reset();
          // console.log('Input: ', result);
          FormHandlersObj.updateGlobalVars( values.input, result.data );
        },
      });
    },
    stripFormLabel(formValues) {
      let newFormValues = {};
      Object.keys(formValues).map( key => {
        let shortKey = key.replace( formValues.input+'_', '');
        newFormValues[ shortKey ] = formValues[ key ];
      });
      return newFormValues;
    },
    addOptionElement(value, text, options) {
      let { selectedValue, title } = options;
      let selected = selectedValue === value ? 'selected="selected"' : '';
      title = title ? String(title) : '';
      return `<option value="${ value }" ${selected} title="${title}"> ${ text } </option>`
    },
    setSelectOptions(optionsData, selectedValue) {
      return [ FormHandlersObj.addOptionElement('', '- select -', false) ]
        .concat(
          optionsData.map( data => {
            let options = { selectedValue, title: data.title || '' };
            return FormHandlersObj.addOptionElement(data.value, data.text, options)
          })
        );
    },
    getOptionElement( parent, value ) {
      if(typeof value === 'undefined') { value = parent.val(); }
      return value !== '' && parent && parent.is('select') ? parent.find(`option[value="${value}"]`) : null;
    },
    getOptionText( elem ) {
      let option = FormHandlersObj.getOptionElement( elem );
      return (option && option.val() !== '' ? option.text() : '').trim();
    },
    showCountryLeagues( select_Country, select_League ) {
      let countryId = select_Country.val();

      select_League.each(function (i,e) {
        let leagueSelectedValue = $(this).val();

        let leagues = GLOBAL_VAR.get('leagues');

        let subGroup = countryId ? leagues.filter( lg => lg.id_country === countryId ) : leagues;

        subGroup = subGroup.map( lg => { return { value: lg.id, text: lg.name }; });

        $(this).html( FormHandlersObj.setSelectOptions(subGroup, leagueSelectedValue) );
      });
    },
    setLeagueCountry( select_League, select_Country ) {
      let leagueId = $(select_League).val();

      let countries = GLOBAL_VAR.get('countries'), leagues = GLOBAL_VAR.get('leagues');

      let selectedLeague = leagues.find( lg => lg.id === leagueId );
      let leagueCountryId = selectedLeague ? selectedLeague.id_country : '';

      select_Country.val( leagueCountryId );
    },
    showLeagueClubs( select_League, select_Club ) {
      let leagueId = select_League.val();

      select_Club.each(function (i,e) {
        let clubSelectedValue = $(this).val();

        let clubs = GLOBAL_VAR.get('clubs');

        let subGroup = leagueId ? clubs.filter( cl => cl.id_league === leagueId ) : clubs;

        subGroup = subGroup.map( cl => { return { value: cl.id, text: cl.name }; });

        $(this).html( FormHandlersObj.setSelectOptions(subGroup, clubSelectedValue) );
      });
    },
    setClubLeague( select_Club, select_League ) {
      let clubId = select_Club.val();

      let leagues = GLOBAL_VAR.get('leagues'), clubs = GLOBAL_VAR.get('clubs');

      let selectedClub = clubs.find( cl => cl.id === clubId );
      let clubLeagueId = selectedClub ? selectedClub.id_league : '';

      select_League.val( clubLeagueId ).trigger('change');
    },
    reloadMatches( select_Matches ) {
      let values = [];
      select_Matches.each(function (i,e) { values.push( $(this).val() ); });

      if(values.length){
        select_Matches.each(function (i,e) {
          let matchSelectedValue = $(this).val();

          $(this).find('option').each(function (j,o) {
            let optionValue = $(this).attr('value');
            $(this).prop( 'disabled', (values.includes(optionValue) && optionValue && optionValue !== matchSelectedValue) );
          });
        });
      }
    },
    updateGlobalVars(type, data) {
      switch(type) {
        case 'club' : { FormHandlersObj.addNewClub( data ); } break;
        case 'match' : { FormHandlersObj.addNewMatch( data ); } break;
      }
    },
    addNewClub( club ) {
      let leagues = GLOBAL_VAR.get('leagues');

      club.league = leagues.find( lg => lg.id === club.id_league );

      GLOBAL_VAR.append('clubs', club);

      let value = club.id, text = club.name;
      // console.log('addNewClub value: '+value+' | text: '+text+' | GLOBAL_VAR: ', GLOBAL_VAR);

      $('.select-clubs').each(function (i,e) {
        $(this).append( FormHandlersObj.addOptionElement( value, text, {} ) )
      });
    },
    addNewMatch( match ) {
      let clubs = GLOBAL_VAR.get('clubs'), leagues = GLOBAL_VAR.get('leagues');

      match.club_1 = clubs.find( cl => cl.id === match.id_club_1);
      match.club_2 = clubs.find( cl => cl.id === match.id_club_2);
      match.league = leagues.find( lg => lg.id === match.id_league);

      GLOBAL_VAR.append('matches', match);

      let value = match.id, text = match.club_1.code + ' vs ' + match.club_2.code;
      let title = match.club_1.name + ' vs ' + match.club_2.name;
      // console.log('addNewMatch value: '+value+' | text: '+text+' | GLOBAL_VAR: ', GLOBAL_VAR);

      $('.select-matches').each(function (i,e) {
        $(this).append( FormHandlersObj.addOptionElement( value, text, { title }) )
      });
    },
    getTicket( ticketId ) {
      let tickets = GLOBAL_VAR.get('tickets');
      let index = tickets.findIndex(t => t.id === ticketId), ticket = index >= 0 ? tickets[ index ] : null;
      return [ index, ticket ];
    },
    saveTempTicket( elem, value ) {
      let cleanValue = value.trim(), inValid = (/[^A-z0-9_]/gi).exec(cleanValue);

      if(elem && elem.is('select') && cleanValue && !inValid) {
        let selectedTicket = elem.val(), tickets = GLOBAL_VAR.get('tickets');

        let exists = tickets.findIndex(t => t.name === cleanValue) >= 0;

        // let index = tickets.findIndex(t => t.id === selectedTicket), ticket = index >= 0 ? tickets[ index ] : null;
        let [ index, ticket ] = FormHandlersObj.getTicket( selectedTicket );

        if(exists) {
          throw new Error(`Ticket with name ${cleanValue} already exists`);
        }

        if(ticket) {
          let newValues = { ...ticket, name: cleanValue };
          GLOBAL_VAR.update( 'tickets', newValues, index);
          FormHandlers.getOptionElement( elem, ticket.id ).text( cleanValue )
        }
        else{
          let newValues = { id: cleanValue, name: cleanValue, bookings: [] };
          GLOBAL_VAR.append( 'tickets', newValues );
          elem.append( FormHandlersObj.addOptionElement( cleanValue, cleanValue, {}) );
        }

        elem.val(function () { return ticket ? selectedTicket : cleanValue; }).trigger('change');
        // console.log('selectedTicket: ', selectedTicket, 'cleanValue: ', cleanValue, 'exists: ', exists, ' | index: ', index, ' | ticket: ', ticket, ' | tickets: ', GLOBAL_VAR.get('tickets'));

        return true;
      }
    },
    addTempBooking() {
      let formId = 'ticketForm', form = $(`#${formId}`), values = FormUtil.values( form );
      values.input = formInputs[ formId ];
      values = FormHandlersObj.stripFormLabel( values );

      let id_ticket = values.id, stake = values.stake;

      let show_countDiv = $('#show_count'), ticket_count = $('#ticket_count');
      show_countDiv.html( 0 );  ticket_count.val( 0 );

      let tickets = GLOBAL_VAR.get('tickets'), index = tickets.findIndex(t => t.id === id_ticket);
      let ticket = index >= 0 ? tickets[ index ] : null, name = ticket ? ticket.name : '';
      // console.log('index :'+index+' | id_ticket: '+id_ticket+' | ticket: ', ticket, ' | values; ', values);

      if(ticket) {
        let n = 1, count = 0, bookings = [], required = ['id_match','id_bet', 'odd'];
        let validRow = true,hasNextValues = true;

        do {
          let row = {
            id: `b${n}`, id_bet: values[`bet_${n}`], id_match: values[`match_${n}`],
            id_ticket: id_ticket, odd: values[`odd_${n}`], outcome: '0'
          };
          row.odd = StringUtil.asNumber( row.odd );

          validRow = Object.keys(row).filter( k => required.includes(k) ).some( k => !!row[k] );

          if( validRow ) {
            bookings.push( row );
            count += 1;
          }
          // console.log('validRow :'+validRow+' | old n: '+n);

          hasNextValues = required.map(key => key.replace('id_', '')).find( key => values.hasOwnProperty(`${key}_${n}`) );

          n += hasNextValues ? 1 : -1;

          // console.log('validRow :'+validRow+' | new n: '+n, ' | hasNextValues; '+ hasNextValues, ' | count: '+count);
        }
        while(hasNextValues);

        let newValues = {
          name: name, stake: stake, status: "0", id: id_ticket, bookings: bookings
        };
        // console.log('n :'+n+' | name :'+name, ' | count; ', count);

        // if( ! newValues.length ) { return; }
        show_countDiv.html( count > 0 ? count : 0 );

        if( count <= 0 ) { return; }

        (index >= 0) ? GLOBAL_VAR.update( 'tickets', newValues, index)  : GLOBAL_VAR.append( 'tickets', newValues );
        // console.log('new tickets:', GLOBAL_VAR.get('tickets'));

        ticket_count.val( count > 0 ? count : 0 );
        // console.log('n :'+n+' | ticket_count: '+ticket_count.val(), ' | count; ', count);

        $('[name^="ticket_odd"]').each(function (i,e) {
          if( $(this).val() === '0' ){ $(this).val('0.00'); }
        });
      }
    },
    displayTicket( id_ticket ) {
      let tickets = GLOBAL_VAR.get('tickets'), ticket = tickets.find(t => t.id === id_ticket);
      let ticketBookings = ticket && ticket.bookings ? ticket.bookings : [];

      if( ticket ) {
        $('#ticketForm')[0].reset();

        $(`#ticket_id`).val( ticket.id );
        $(`#ticket_stake`).val( ticket.stake );
        $(`#ticket_count`).val( ticketBookings.length );
        $(`#show_count`).html( ticketBookings.length );

        if(ticketBookings.length) {
          ticketBookings.forEach((book, i) => {
            let sn = (i+1);
            $(`#ticket_match${sn}`).val( book.id_match ).trigger('change');
            $(`#ticket_bet${sn}`).val( book.id_bet );
            $(`#ticket_odd${sn}`).val( book.odd );
          })
        }
      }
    }
    /*addSavedBooking( booking ) {
      if(booking && Array.isArray(booking)){ GLOBAL_VAR.append('tickets', booking); }
    },*/

  };

  return FormHandlersObj;

})();
