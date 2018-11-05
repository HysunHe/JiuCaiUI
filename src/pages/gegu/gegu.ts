import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as echarts from 'echarts';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-gegu',
  templateUrl: 'gegu.html'
})
export class GeguPage {
  items: any;
  matchedItems: any;
  selectedItem: any;
  histItems: any;
  showList: boolean;
  showHistCharts: any = {};

  constructor(private storage: Storage, private http: Http, navCtrl: NavController) {
    this.showHistCharts.hist = true;
    this.showHistCharts.geguchart = false;
    this.matchedItems = [];
    this.selectedItem = {code: '', name: '', pinYin: '', firstLetters: ''};
    this.items = storage.get("stocks");
    this.histItems = storage.get("histItems").then((val) => {
      if(val === null) {
        this.histItems = [];
      } else {
        this.histItems = val;
      }
      console.log("histItems", this.histItems);
      for(let i=1; i<=this.histItems.length; i++) {
        console.log(this.histItems[i-1]);
        this.loadLuGuTongPoints(this.histItems[i-1], 'geguchart' + i);
        this.showHistCharts["geguchart" + i] = true;
      }
    });

    http.get('http://localhost:8080/sync-service/data/listStocks')
    .map(res => res.json())
    .subscribe(data => {
       this.items = data; 
       storage.set("stocks", data);
    });
  }

  getMatchedStocks(ev: any) {
    this.showList = true;
    // set val to the value of the searchbar
    const val = ev.target.value;
    console.log("*** val: " + ev.target.value);
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.matchedItems = this.items.filter((item) => {
        return (item.code.indexOf(val) > -1);
      })
    }
  }

  itemTapped(ev:any, item:any) { 
    this.showList = false;
    this.showHistCharts.hist = false;
    this.showHistCharts.geguchart = true;
    this.selectedItem.name = item.name;
    this.selectedItem.code = item.code;
    this.selectedItem.firstLetters = item.firstLetters;
    this.selectedItem.pinYin = item.pinYin;
    this.loadLuGuTongPoints(item, 'geguchart');

    let tempHistItems = this.histItems.filter((e) => e.code !== item.code);
    tempHistItems.unshift(item);
    if(tempHistItems.length > 20) {
      tempHistItems.pop();
    }
    this.histItems = tempHistItems;
    this.storage.set("histItems", this.histItems);
  }

  loadLuGuTongPoints(item: any, id: string) {
    let code: string = item.code;
    console.log("*** Generating chart: " + id + " | code: " + code);
    this.http.get("http://localhost:8080/sync-service/data/geguchart?code=" + code + "&limit=30")
      .map(res => res.json()).subscribe(data => {
        let dataArray = [], labelArray = [];
        data.forEach(e => {
          dataArray.unshift(e.value);
          labelArray.unshift(e.date);
        });
        const ec = echarts as any;
        var dapanchart = ec.init(document.getElementById(id));
        var option = {
          tooltip: {
            trigger: 'axis',
            position: function (pt) {
              return [pt[0], '10%'];
            }
          },
          title: {
            left: 'center',
            text: item.name + '日汇总',
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: labelArray
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
          },
          series: [
            {
              name: '资金变化',
              type: 'line',
              itemStyle: {
                color: 'rgb(255, 70, 131)'
              },
              areaStyle: {
                color: new echarts.graphic["LinearGradient"](0, 0, 0, 1, [{
                  offset: 0,
                  color: 'red'
                }, {
                  offset: 1,
                  color: 'green'
                }])
              },
              data: dataArray
            }
          ]
        };
        dapanchart.setOption(option);
      }, (err) => {
        console.error("!!! Failed loading dapan points!");
      });
  }
}
