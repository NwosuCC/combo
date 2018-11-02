
const FormHandlers = (function () {

  const formInputs = {
    leagueForm: 'league',
    clubForm: 'club',
    matchForm: 'match',
    bookingForm: 'booking',
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
      console.log('addNewClub value: '+value+' | text: '+text+' | GLOBAL_VAR: ', GLOBAL_VAR);

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
      console.log('addNewMatch value: '+value+' | text: '+text+' | GLOBAL_VAR: ', GLOBAL_VAR);

      $('.select-matches').each(function (i,e) {
        $(this).append( FormHandlersObj.getOption( value, text, { title }) )
      });
    },
    addNewTicket( elem, value ) {
      let cleanValue = value.trim(), inValid = (/[^A-z0-9_]/gi).exec(cleanValue);

      if(elem && elem.is('select') && cleanValue && !inValid) {
        GLOBAL_VAR.append('tickets', value);
        elem.append( FormHandlersObj.getOption( value, value, {}) );
        return true;
      }
    },
    addTempBooking() {
      let formId = 'bookingForm', form = $(`#${formId}`), values = FormUtil.values( form );
      values.input = formInputs[ formId ];
      values = FormHandlersObj.stripFormLabel( values );

      let ticket = values.ticket, stake = values.stake;

      let bookings = GLOBAL_VAR.get('bookings');
      let index = bookings.findIndex(b => b.length && b[0].ticket === ticket), newValues = [];

      let n = 1, valid = true, required = ['id_match','bet', 'odd', 'code'];

      do {
        let row = {
          bet: values[`bet_${n}`], code: '', id: `t${n}`, id_match: values[`match_${n}`],
          odd: values[`odd_${n}`], stake: stake, status: "0", ticket: ticket
        };

        valid = Object.keys(row).filter( k => required.includes(k) ).some( k => !!row[k] );
        if( valid ) { newValues.push( row ); }
        n += valid ? 1 : -1;
      }
      while(valid);

      if( ! newValues.length ) { return; }

      $('#booking_count').val( n );
      (index >= 0) ? GLOBAL_VAR.update( 'bookings', newValues, index)  : GLOBAL_VAR.append( 'bookings', newValues )
    },
    displayTicket( ticket ) {
      let bookings = GLOBAL_VAR.get('bookings');
      let ticketBooks = bookings.find(b => b.length && b[0].ticket === ticket) || [];

      if(ticketBooks.length) {
        $('#bookingForm')[0].reset();

        $(`#booking_ticket`).val( ticketBooks[0].ticket );
        $(`#booking_stake`).val( ticketBooks[0].stake );
        $(`#booking_count`).val( ticketBooks.length );

        ticketBooks.forEach((book, i) => {
          let sn = (i+1);
          $(`#booking_match${sn}`).val( book.id_match ).trigger('change');
          $(`#booking_bet${sn}`).val( book.bet );
          $(`#booking_odd${sn}`).val( book.odd );
        })
      }
    }
    /*addSavedBooking( booking ) {
      if(booking && Array.isArray(booking)){ GLOBAL_VAR.append('bookings', booking); }
    },*/

  };

  return FormHandlersObj;

})();
