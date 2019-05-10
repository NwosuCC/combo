
const SupplementaryData = (function() {
  return {
    years: (() => {
      let years = [], currentYear = (new Date()).getFullYear();
      for(let n = 9; n >= 0; n-- ){ years.push( currentYear - n ); }
      return years;
    })()
  }
})();


const updateModelRelations = (data) => {
  if(data.hasOwnProperty('countries') && data.hasOwnProperty('leagues')){
    let countries = data.countries, leagues = data.leagues;

    data.leagues = leagues.map( league => {
      league['country'] = countries.find( ctr => ctr.id === league['id_country']);
      return league;
    });

    if(data.hasOwnProperty('clubs')){
      let clubs = data.clubs;

      data.clubs = clubs.map( club => {
        club['league'] = leagues.find( lg => lg.id === club['id_league']);
        return club;
      });

      if(data.hasOwnProperty('matches')){
        let matches = data.matches;

        data.matches = matches.map( match => {
          match['club_1'] = clubs.find( cl => cl.id === match['id_club_1']);
          match['club_2'] = clubs.find( cl => cl.id === match['id_club_2']);
          match['league'] = leagues.find( lg => lg.id === match['id_league']);
          return match;
        });
      }
    }

    if(data.hasOwnProperty('tickets')){
      data.savedTickets = data.tickets.concat([]);

      if(data.hasOwnProperty('bookings')){
        let matches = data.matches, bets = data.bets, bookings = data.bookings;

        data.bookings = bookings.map( book => {
          book['match'] = matches.find( match => match.id === book.id_match);
          book['bet'] = bets.find( bet => bet.id === book.id_bet);
          return book;
        });
      }
    }

    return data;
  }

  return [];
};

// App Start
$.ajaxSetup({
  url: "index.php",
  dataType: 'json',
  type: "GET",
  data: "data='all'",
  error: function (xhr, status, error) {
    console.log('Ajax error: ', error, '\n status: ', xhr);
  },
  complete: function (xhr, status) {

  }
});

$.ajax({
  contentType: 'application/json',

  success: function(result, status, xhr){
    result = updateModelRelations( result );

    result = { ...SupplementaryData, ...result };

    console.log('Data: ', result);

    GLOBAL_VAR.set( 'data', result);

    const afterInit = () => {
      setTimeout(() => {
        let tickets = GLOBAL_VAR.get( 'tickets');
        let accumulation = TicketHandler.run( tickets.length ? tickets[2].id : '', 'PA' );
        console.log('ticket Id: '+tickets[2].id+' | accumulation: ', accumulation);
      });
    };

    xnTPL()
      .pipes( StringUtil )
      .init({
        data_1: GLOBAL_VAR.get(), data_2: { org: { test: true } }
      }, afterInit);
  },
});


$(document).ready(function () {

  const showHideClass = '.x-hide, .x-show';

  $(document).find('.x-hide').hide();
  $(document).find('.x-show').show();

  $(document)
    .on({
      click() { FormHandlers.submit( $(this) ) }
    }, '.submit-btn')

    .on({
      change() {
        let elem = $(this), childElem = $('[data-lgctr]');
        FormHandlers.showCountryLeagues( elem, childElem ) ;
        $('[data-clblg]').val('');
      }
    }, '[data-ctrlg]')

    .on({
      change() {
        let elem = $(this), parentElem = $('[data-ctrlg]');
        FormHandlers.setLeagueCountry( elem, parentElem ) ;
      }
    }, '[data-lgctr]')

    .on({
      change() {
        let elem = $(this), childElem = $('[data-clblg]');
        FormHandlers.showLeagueClubs( elem, childElem ) ;
      }
    }, '[data-lgclb]')

    .on({
      change() {
        let elem = $(this), parentElem = $('[data-lgclb]');
        FormHandlers.setClubLeague( elem, parentElem ) ;
      }
    }, '[data-clblg]')

    .on({
      change() {
        $(this).val(function () { return StringUtil.asNumber( $(this).val() ); });
      }
    }, '.input-number')

    .on({
      focus() {
        if( $(this).val() ) {
          $(this).val(function () { return StringUtil.withOptionalDecimal( $(this).val() ); });
        }
      },
      blur() {
        $(this).val(function () { return StringUtil.asCurrency( $(this).val() ); });
      },
    }, '.input-currency')

   .on({
      change() {
        FormHandlers.reloadMatches( $('.select-matches') ) ;
      }
    }, '.select-matches')

    .on({
      click() {
        let addBtn = $(this).hasClass('add-btn'), editBtn = $(this).hasClass('edit-btn');
        let okBtn = $(this).hasClass('ok-btn'), xBtn = $(this).hasClass('x-btn');

        let target = $(this).data('target'), targetElem = $(`#${target}`);
        let alt = targetElem.data('alt'), altElem = $(`#${alt}`);

        let result = true, value = '';

        if(target && targetElem && alt && altElem) {
          if(okBtn) {
            value = targetElem.val();
            switch ( target ) {
              case 'ticket_name' : { result = FormHandlers.saveTempTicket( altElem, value ); } break;
            }
          }

          if(result) {
            if(addBtn || editBtn) {
              targetElem.parents(showHideClass).show();
              altElem.parents(showHideClass).hide();
            }else{
              targetElem.parents(showHideClass).hide();
              altElem.parents(showHideClass).show();
              if(okBtn) { FormHandlers.addTempBooking(); }
            }
          }

          targetElem.val( FormHandlers.getOptionText( altElem ) );
        }
      }
    }, '.add-btn, .edit-btn, .ok-btn, .x-btn')

    .on({
      change() {
        let id_ticket = $(this).val();
        let tickets = GLOBAL_VAR.get('tickets'), ticket = tickets.find( t => t.id === id_ticket );
        let savedTickets = GLOBAL_VAR.get('savedTickets'), savedTicket = savedTickets.find( t => t.id === id_ticket );

        let editButtons = $('#editButtons'), saveBtn = $('#saveBooking');
        let btnNew = editButtons.find('button.x-show'), btnUpdate = editButtons.find('button.x-hide');
        let spanNew = saveBtn.find('span.x-show'), spanUpdate = saveBtn.find('span.x-hide');

        if( id_ticket ) {
          btnNew.hide(); btnUpdate.show();
          FormHandlers.displayTicket( id_ticket );
          if( ticket ) { $('#ticket_name').val( ticket.name ); }
        }else{
          btnNew.show(); btnUpdate.hide();
        }

        if( id_ticket && savedTicket ) {
          spanNew.hide(); spanUpdate.show();
        }else{
          spanNew.show(); spanUpdate.hide();
        }
      }
    }, '#ticket_id')

    .on({
      change() {
        if( $(this).attr('id') === 'ticket_id' ) { return; }
        FormHandlers.addTempBooking();
      }
    }, '#ticketForm input, #ticketForm select')
  ;

});
