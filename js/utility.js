function currentTime() {
  // The time in database is based on UTC time,
  // we need to convert them to Melbourne time
  let today = new Date();
  let hour = today.getUTCHours();
  if (hour >= 0 && hour < 14) {
    hour = hour + 10;
  } else if (hour > 14 && hour < 24) {
    hour = hour - 14;
  } else {
    // hour = 14
    hour = 0;
  }
  let time = hour + ":" + today.getMinutes() + ":" + today.getSeconds();
  return time;
}

function currentDate() {
  // Melbourne time is UTC+10
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let dum = today.getDate();
  let hour = today.getUTCHours();

  // Consider leap year
  if (year % 100 === 0) {
    // leap year
    if (hour >= 0 && hour < 14) {
      // same day with UTC time
      hour = hour + 10;
    } else if (hour > 14 && hour < 24) {
      // add one day to melbourne
      hour = hour - 14;
      if (month === 2) {
        if (dum === 29) {
          dum = 1;
          month = month + 1;
        }
      }
      if (
        month === 1 ||
        month === 3 ||
        month === 5 ||
        month === 7 ||
        month === 8 ||
        month === 10
      ) {
        if (dum === 31) {
          dum = 1;
          month = month + 1;
        }
      }
      if (month === 12) {
        if (dum === 31) {
          dum = 1;
          month = 1;
        }
      }
      if (month === 4 || month === 6 || month === 9 || month === 11) {
        if (dum === 30) {
          dum = 1;
          month = month + 1;
        }
      }
    } else {
      // hour = 14
      hour = 0;
      if (month === 2) {
        if (dum === 29) {
          dum = 1;
          month = month + 1;
        }
      }
      if (
        month === 1 ||
        month === 3 ||
        month === 5 ||
        month === 7 ||
        month === 8 ||
        month === 10
      ) {
        if (dum === 31) {
          dum = 1;
          month = month + 1;
        }
      }
      if (month === 12) {
        if (dum === 31) {
          dum = 1;
          month = 1;
        }
      }
      if (month === 4 || month === 6 || month === 9 || month === 11) {
        if (dum === 30) {
          dum = 1;
          month = month + 1;
        }
      }
    }
  } else {
    if (year % 4 === 0) {
      // leap year
      if (hour >= 0 && hour < 14) {
        // same day with UTC time
        hour = hour + 10;
      } else if (hour > 14 && hour < 24) {
        // add one day to melbourne
        hour = hour - 14;
        if (month === 2) {
          if (dum === 29) {
            dum = 1;
            month = month + 1;
          }
        }
        if (
          month === 1 ||
          month === 3 ||
          month === 5 ||
          month === 7 ||
          month === 8 ||
          month === 10
        ) {
          if (dum === 31) {
            dum = 1;
            month = month + 1;
          }
        }
        if (month === 12) {
          if (dum === 31) {
            dum = 1;
            month = 1;
          }
        }
        if (month === 4 || month === 6 || month === 9 || month === 11) {
          if (dum === 30) {
            dum = 1;
            month = month + 1;
          }
        }
      } else {
        // hour = 14
        hour = 0;
        if (month === 2) {
          if (dum === 29) {
            dum = 1;
            month = month + 1;
          }
        }
        if (
          month === 1 ||
          month === 3 ||
          month === 5 ||
          month === 7 ||
          month === 8 ||
          month === 10
        ) {
          if (dum === 31) {
            dum = 1;
            month = month + 1;
          }
        }
        if (month === 12) {
          if (dum === 31) {
            dum = 1;
            month = 1;
          }
        }
        if (month === 4 || month === 6 || month === 9 || month === 11) {
          if (dum === 30) {
            dum = 1;
            month = month + 1;
          }
        }
      }
    } else {
      // not leap year
      if (hour >= 0 && hour < 14) {
        // same day with UTC time
        hour = hour + 10;
      } else if (hour > 14 && hour < 24) {
        // add one day to melbourne
        hour = hour - 14;
        if (month === 2) {
          if (dum === 28) {
            dum = 1;
            month = month + 1;
          }
        }
        if (
          month === 1 ||
          month === 3 ||
          month === 5 ||
          month === 7 ||
          month === 8 ||
          month === 10
        ) {
          if (dum === 31) {
            dum = 1;
            month = month + 1;
          }
        }
        if (month === 12) {
          if (dum === 31) {
            dum = 1;
            month = 1;
          }
        }
        if (month === 4 || month === 6 || month === 9 || month === 11) {
          if (dum === 30) {
            dum = 1;
            month = month + 1;
          }
        }
      } else {
        // hour = 14
        hour = 0;
        if (month === 2) {
          if (dum === 29) {
            dum = 1;
            month = month + 1;
          }
        }
        if (
          month === 1 ||
          month === 3 ||
          month === 5 ||
          month === 7 ||
          month === 8 ||
          month === 10
        ) {
          if (dum === 31) {
            dum = 1;
            month = month + 1;
          }
        }
        if (month === 12) {
          if (dum === 31) {
            dum = 1;
            month = 1;
          }
        }
        if (month === 4 || month === 6 || month === 9 || month === 11) {
          if (dum === 30) {
            dum = 1;
            month = month + 1;
          }
        }
      }
    }
  }
  if (month.toString().length === 1) {
    month = "0" + month;
  }
  if (dum.toString().length === 1) {
    dum = "0" + dum;
  }
  let date = year + "-" + month + "-" + dum;
  return date;
}

function between_dates(date1, date2) {   
  //calculate the time interval between two dates
  date1 = Date.parse(date1);
  date2 = Date.parse(date2);
  var difference= Math.abs(date2 - date1);
  var days = Math.floor(difference / (24 * 3600 * 1000));
  return days + 1 ;
}
function get_weekly_dates(date)
{
  date = Date.parse(date);
  var time = new Date(date);
  var day = time.getDay();
  if (day == 0)
    day = 7;
  var week = 7;
  let days = [];
  var time = new Date(date);
    for(let i=24*(week-day); i>= 24;i-=24){	
    let dateItem=new Date(time.getTime() + i * 60 * 60 * 1000);	
    let y = dateItem.getFullYear();	
    let m = dateItem.getMonth() + 1;
    let d= dateItem.getDate();	
    m = addDate0(m);
    d = addDate0(d);	
    let valueItem= y + '-' + m + '-' + d;	
    days.push(valueItem);	
  }
  for(let i = 0; i< (24*day);i+=24){		
    let dateItem=new Date(time.getTime() - i * 60 * 60 * 1000);	
    let y = dateItem.getFullYear();
    let m = dateItem.getMonth() + 1;	
    let d= dateItem.getDate();
    m = addDate0(m);
    d = addDate0(d);
    let valueItem= y + '-' + m + '-' + d;	
    days.push(valueItem);	
  }
  days.sort()
  return days;	
}
// console.log(get_weekly_dates('2022-05-12'))
function get_7days(date){
  date = Date.parse(date);
  let days = [];
  var time = new Date(date);
  for(let i=24*6; i>= 0;i-=24){		
    let dateItem=new Date(time.getTime() - i * 60 * 60 * 1000);	
    let y = dateItem.getFullYear();	
    let m = dateItem.getMonth() + 1;	
    let d= dateItem.getDate();	
    m = addDate0(m);	
    d = addDate0(d);	
    let valueItem= y + '-' + m + '-' + d;	
    days.push(valueItem);	
  }
  return days;	
}
// get day before
function get_day_before(date)
{
  var date = Date.parse(date)
  var date2 = new Date(date)
  var dateItem=new Date(date2.getTime()-(24*60 * 60 * 1000));
  let y = dateItem.getFullYear();	
  let m = dateItem.getMonth() + 1;	
  let d= dateItem.getDate();	
  m = addDate0(m);	
  d = addDate0(d);	
  let valueItem= y + '-' + m + '-' + d;	
  return valueItem
}
function 	addDate0(time){
  if (time.toString().length == 1) {
    time = '0' + time.toString();
  }
  return time;
}
// var date = get_day_before('2022-05-02')
// console.log(get_weekly_dates(date))

module.exports = {
  currentTime,
  currentDate,
  between_dates,
  get_7days,
  get_day_before,
  get_weekly_dates
};
