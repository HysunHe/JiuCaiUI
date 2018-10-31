import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as echarts from 'echarts';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController, private http: Http) {
    console.log("*** LuGuTong page ***");
  }

  ionViewDidEnter() {
    this.loadLuGuTongPoints();
  }

  loadLuGuTongPoints() {
    this.http.get("http://localhost:8080/sync-service/data/lugutongchart?limit=30")
      .map(res => res.json()).subscribe(data => {
        let dataArray = [], labelArray = [];
        data.forEach(e => {
          dataArray.unshift(e.value);
          labelArray.unshift(e.date);
        });
        const ec = echarts as any;
        var dapanchart = ec.init(document.getElementById('lugutongchart'));
        var option = {
          tooltip: {
            trigger: 'axis',
            position: function (pt) {
              return [pt[0], '10%'];
            }
          },
          title: {
            left: 'center',
            text: '陆股通日汇总统计图',
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
