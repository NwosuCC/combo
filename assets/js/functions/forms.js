
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

      let formValues = FormHandlersObj.stripFormLabel(values);
      console.log('formId: '+formId+' | formValues: ', formValues);

      $.ajax({
        type: "POST",
        data: formValues ,
        success: function(result, status, xhr){
          $(formSelector)[0].reset();
          console.log('Input: ', result);
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
    getOption(value, text, options) {
      let { selectedValue, title } = options;
      let selected = selectedValue === value ? 'selected="selected"' : '';
      title = title ? String(title) : '';
      return `<option value="${ value }" ${selected} title="${title}"> ${ text } </option>`
    },
    getSelectOptions(optionsData, selectedValue) {
      return [ FormHandlersObj.getOption('', '- select -', false) ]
        .concat(
          optionsData.map( data => {
            let options = { selectedValue, title: data.title || '' };
            return FormHandlersObj.getOption(data.value, data.text, options)
          })
        );
    },
    showCountryLeagues( select_Country, select_League ) {
      let countryId = select_Country.val();

      select_League.each(function (i,e) {
        let leagueSelectedValue = $(this).val();

        let leagues = GLOBAL_VAR.get('leagues');

        let subGroup = countryId ? leagues.filter( lg => lg.id_country === countryId ) : leagues;

        subGroup = subGroup.map( lg => { return { value: lg.id, text: lg.name }; });

        $(this).html( FormHandlersObj.getSelectOptions(subGroup, leagueSelectedValue) );
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

        $(this).html( FormHandlersObj.getSelectOptions(subGroup, clubSelectedValue) );
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
        $(this).append( FormHandlersObj.getOption( value, text, {} ) )
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
        $(this).append( FormHandlersObj.getOption( value, text, { title }) )
      });
    },
    addNewTicket( elem, value ) {
      let cleanValue = value.trim(), inValid = (/[^A-z0-9_]/gi).exec(cleanValue);

      if(elem && elem.is('select') && cleanValue && !inValid) {
        GLOBAL_VAR.append('tickets', { id: cleanValue, name: cleanValue, bookings: [] });
        elem.append( FormHandlersObj.getOption( cleanValue, cleanValue, {}) );
        return true;
      }
    },
    addTempBooking() {
      let formId = 'ticketForm', form = $(`#${formId}`), values = FormUtil.values( form );
      values.input = formInputs[ formId ];
      values = FormHandlersObj.stripFormLabel( values );

      let id_ticket = values.name, stake = values.stake;

      let tickets = GLOBAL_VAR.get('tickets'), index = tickets.findIndex(t => t.id === id_ticket);
      let ticket = index >= 0 ? tickets[ index ] : null, name = ticket ? ticket.name : '';

      if(ticket) {
        let n = 1, valid = true, bookings = [], required = ['id_match','id_bet', 'odd'];

        do {
          let row = {
            id: `b${n}`, id_bet: values[`bet_${n}`], id_match: values[`match_${n}`],
            id_ticket: id_ticket, odd: values[`odd_${n}`], outcome: '0'
          };
          row.odd = StringUtil.asNumber( row.odd );

          valid = Object.keys(row).filter( k => required.includes(k) ).some( k => !!row[k] );
          if( valid ) { bookings.push( row ); }
          // console.log('valid :'+valid+' | n: '+n, ' | row; ', row);

          n += valid ? 1 : -1;
        }
        while(valid);

        let newValues = {
          name: name, stake: stake, status: "0", id: id_ticket, bookings: bookings
        };
        // console.log('name :'+name, ' | newValues; ', newValues);

        // if( ! newValues.length ) { return; }
        if( n <= 0 ) { return; }

        (index >= 0) ? GLOBAL_VAR.update( 'tickets', newValues, index)  : GLOBAL_VAR.append( 'tickets', newValues );
        // console.log('new tickets:', GLOBAL_VAR.get('tickets'));

        $('#ticket_count').val( n );

        $('[name^="ticket_odd"]').each(function (i,e) {
          if( $(this).val() === '0' ){ $(this).val('0.00'); }
        });
      }
    },
    displayTicket( id_ticket ) {
      let tickets = GLOBAL_VAR.get('tickets'), ticket = tickets.find(t => t.id === id_ticket);
      let ticketBookings = ticket ? ticket.bookings : [];

      if( ticket ) {
        $('#ticketForm')[0].reset();

        $(`#ticket_name`).val( ticket.id );
        $(`#ticket_stake`).val( ticket.stake );
        $(`#ticket_count`).val( ticketBookings.length );

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
